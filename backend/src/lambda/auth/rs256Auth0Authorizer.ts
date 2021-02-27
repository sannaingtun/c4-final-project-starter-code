
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const cert = `-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIJT2rwr21os6HYMA0GCSqGSIb3DQEBCwUAMCMxITAfBgNV
BAMTGHNhbm5haW5ndHVuLmpwLmF1dGgwLmNvbTAeFw0yMTAyMjUxMzAxMDNaFw0z
NDExMDQxMzAxMDNaMCMxITAfBgNVBAMTGHNhbm5haW5ndHVuLmpwLmF1dGgwLmNv
bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANF8PS7kAi+Zk3kfRzsp
qio+BzuJjtFz8wE+Ctjf0TNh8YtsFdluMF52ZsosC9OCZEq+SeCqV/P8QJE+gXP+
6dFS0w6BKEw+S6zi3JsP+Rl+vgO18MYFu5lbhRmTfbwwmz2uW3IMZjkFlFFxpvlL
NltVtKAW13xGn0evS5kj8dmnCyFt1bzwjYdC6w5hiunjFy454bwTsYlFDLmk9qZr
wNM5za4biX+4djJiGbAi86MCp5A4CcHmczwYTezAcV8aI8ZiVeqXwFtKtRJCDe+J
KEqfCxLnJTtJIyTRStZGagNJzkLJoMdKgxOs/zBPBgSzpyS3tITiEfX+bBNZMOqV
8zMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUFhZPVQI25DjF
D8MdbhBpohGdRycwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQBI
RdJSYKLBqahnxxRb+O9FHTuTa0z9SRawOl+fnoGg0bnB5xSJ27brOsoIsMGcLO/u
l96djWQJ0e/hJG+VqMfgHHCNQPsIdf0E+tjFOEeX2tDNxOkAS26Hjfc6oM0XzGjH
yGO0Cvn28T7MPb+TZvcB3aAYfksoydShNNzXBxmclMT7YiVKSgHsd5Urf0KB4mjA
CfqKudxWWYGX+8kfmxRI6USspP8izK8mucIUtSoO/ug9Z0UzARH4Bz0GOzrhuqWX
Ha+MRJzQolbVZyWNrfff/2NgcYssUfZA1Vc0vVWhwyV1fzq9UZN8CSAnNxqb/i4I
qGO2oKQ+tM4FjIGfcCu5
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)
    
    const logger = createLogger('auth')
    logger.info('User was authorized', {
      key: jwtToken
    })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
