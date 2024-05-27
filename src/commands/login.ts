/* eslint camelcase: 0, no-unmodified-loop-condition: 0, no-await-in-loop: 0 */
import http from 'node:http'
import { Command, ux } from '@oclif/core'
import { generators } from 'openid-client'
import open from 'open'
import createDebug from 'debug'
import sleep from '../sleep'
import { updateCodeGenieConfig } from '../config'
import { REDIRECT_URL, getOpenIdClient } from '../openid-client'
import { getRandom } from '../get-random'

const debug = createDebug('codegenie:Login')

export default class Login extends Command {
  static description = 'Login'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const codeVerifier = generators.codeVerifier()
    const codeChallenge = generators.codeChallenge(codeVerifier)
    const openIdClient = await getOpenIdClient()
    const state = getRandom()
    const nonce = getRandom()
    const authorizationUrl = await openIdClient.authorizationUrl({
      scope: 'aws.cognito.signin.user.admin email openid phone profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    })
    debug('authorizationUrl: %s', authorizationUrl)

    let params

    const server = http
      .createServer((req, res) => {
        if (req.url?.startsWith('/?')) {
          params = openIdClient.callbackParams(req)
          res.writeHead(302, {
            Location: 'https://app.codegenie.codes/cli-login-success',
          })
          // res.end('Logged into Code Genie CLI. You may now close this tab and return to the CLI.')
          res.end()
        } else {
          res.end('Unsupported')
        }
      })
      .listen(6363)

    ux.action.start('Authenticate in browser and then return to the CLI')
    open(authorizationUrl)

    while (!params) {
      await sleep(500)
    }

    const tokenSet = await openIdClient.callback(REDIRECT_URL, params, { code_verifier: codeVerifier, state, nonce })
    ux.action.stop('Authentication successful! 🎉')
    ux.action.start('Updating config')

    updateCodeGenieConfig({
      tokens: {
        idToken: tokenSet.id_token!,
        accessToken: tokenSet.access_token!,
        refreshToken: tokenSet.refresh_token!,
        expiresAt: tokenSet.expires_at!,
      },
    })
    ux.action.stop('Success! 🎉')
    server.close()
  }
}
