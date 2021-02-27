import 'source-map-support/register'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
import { getAllTodos } from '../../businessLogic/Todos'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing event: ', event)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const result = await getAllTodos(userId)
  console.log('result : ', result)
    
  const logger = createLogger('getTodos')
  logger.info('Todos are quired', {
    result : result
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: result
    })
  }
}
