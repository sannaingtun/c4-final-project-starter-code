import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<String> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  await todoAccess.createTodo({
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: createTodoRequest.done,
    attachmentUrl: createTodoRequest.attachmentUrl,
    userId: userId
  })
  return itemId
}

export async function deleteTodo(userId: string, todoId: string): Promise<string>  {
    return await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<any> {

    return await todoAccess.updateTodo(userId, todoId, updateTodoRequest)
}

export async function updateImageURL(
    userId: string,
    todoId: string
): Promise<String> {

    return await todoAccess.generateUploadUrl(userId, todoId)
}
