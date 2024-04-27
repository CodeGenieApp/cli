/* eslint camelcase: 0 */
import { Issuer, custom } from 'openid-client'
import createDebug from 'debug'

const debug = createDebug('codegenie:generate')
const ISSUER_URL =
  process.env.ISSUER_URL || 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_f3rGKpACm/.well-known/openid-configuration'
const CLIENT_ID = process.env.CLIENT_ID || '1hj46eagb68b732f531hp3bc01'
export const REDIRECT_URL = 'http://localhost:6363'
debug('ISSUER_URL: %s, CLIENT_ID: %s', ISSUER_URL, CLIENT_ID)
custom.setHttpOptionsDefaults({
  timeout: 8000,
})

export async function getOpenIdClient() {
  const issuer = await Issuer.discover(ISSUER_URL)

  const openIdClient = new issuer.Client({
    client_id: CLIENT_ID,
    redirect_uris: [REDIRECT_URL],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  })

  return openIdClient
}
