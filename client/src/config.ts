// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '1m1qoh1ee7'
export const apiEndpoint = `https://${apiId}.execute-api.ap-northeast-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'sannaingtun.jp.auth0.com',            // Auth0 domain
  clientId: 'nKCIw3eaCETnPD42RtPguXACV51WNjhf',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
