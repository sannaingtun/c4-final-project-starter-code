import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as AWSXRay from 'aws-xray-sdk'

import * as AWS  from 'aws-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('generateUploadUrl')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly S3 = new XAWS.S3({
      signatureVersion: 'v4'
    })) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all groups')

    var params_query = {
      TableName: this.todosTable,
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      KeyConditionExpression: '#userId = :userId',
    };
    const result = await this.docClient.query(params_query).promise();

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(userId: string, todoId: string): Promise<any> {
    console.log("Deleting todo");
    const params = {
        TableName: this.todosTable,
        Key: { userId, todoId }
    };
    const result = await this.docClient.delete(params).promise();
    console.log(result);
    return { Deleted: result }
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<any> {
    const updtedTodo = await this.docClient.update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        UpdateExpression: "set #todoName = :name, done = :done, dueDate = :dueDate",
        ExpressionAttributeNames: {
            "#todoName": "name"
        },
        ExpressionAttributeValues: {
            ":name": updatedTodo.name,
            ":done": updatedTodo.done,
            ":dueDate": updatedTodo.dueDate
        }
    }).promise();
    return { Updated: updtedTodo };
  }

  async generateUploadUrl(userId: string, todoId: string): Promise<string> {
    const url = this.S3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
    const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId
    const options = {
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        UpdateExpression: "set attachmentUrl = :r",
        ExpressionAttributeValues: {
            ":r": attachmentUrl
        },
        ReturnValues: "UPDATED_NEW"
    };
    await this.docClient.update(options).promise()
    logger.info("Presigned url generated successfully ", url)
    return url;
  }
}
