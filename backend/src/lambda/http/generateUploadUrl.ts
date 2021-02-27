import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

import * as uuid from 'uuid';
import { updateImageURL } from '../../businessLogic/Todos'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk';
import * as AWSXRay from "aws-xray-sdk";

const logger = createLogger('generateUploadUrl')

const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.TODOITEM_S3_BUCKET_NAME;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  
  console.log('Processing event: ', event)  
  
  const attachmentId = uuid.v4();

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  });

  updateImageURL(userId, todoId, attachmentId)
  logger.info('uploadUrl', {
    todoId: todoId,
    userId: userId,
    uploadUrl : uploadUrl
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}
