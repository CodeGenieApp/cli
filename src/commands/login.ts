/* eslint camelcase: 0, no-unmodified-loop-condition: 0, no-await-in-loop: 0, no-promise-executor-return: 0 */

import { Command } from '@oclif/core'
import { Issuer, generators } from 'openid-client'
import open from 'open'
import http from 'node:http'
import sleep from '../sleep.js'

const ISSUER_URL =
  process.env.ISSUER_URL || 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_f3rGKpACm/.well-known/openid-configuration'
const CLIENT_ID = '1hj46eagb68b732f531hp3bc01'
const REDIRECT_URL = 'http://localhost:6363'
export default class Login extends Command {
  static description = 'Login'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const issuer = await Issuer.discover(ISSUER_URL)

    const client = new issuer.Client({
      client_id: CLIENT_ID,
      redirect_uris: [REDIRECT_URL],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    })

    const code_verifier = generators.codeVerifier()
    const code_challenge = generators.codeChallenge(code_verifier)
    const state = uuid()
    const nonce = uuid()
    const authorizationUrl = await client.authorizationUrl({
      scope: 'aws.cognito.signin.user.admin email openid phone profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    })

    let params

    const server = http
      .createServer((req, res) => {
        if (req.url?.startsWith('/?')) {
          params = client.callbackParams(req)
          res.writeHead(302, {
            Location: 'https://app.codegenie.codes',
            // add other headers here...
          })
          res.end()
        } else {
          res.end('Unsupported')
        }
      })
      .listen(6363)

    open(authorizationUrl)

    while (params === undefined) {
      await sleep(500)
    }

    const tokenSet = await client.callback(REDIRECT_URL, params, { code_verifier, state, nonce })
    server.close()

    console.log(tokenSet)
  }
}
function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x1_00_00)
      .toString(16)
      .slice(1)
  }

  return (
    s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4()
  )
}
