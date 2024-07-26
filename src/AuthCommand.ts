import { Command } from '@oclif/core'
import axios from 'axios'
import createDebug from 'debug'
import { CodeGenieConfig, getCodeGenieConfig, updateCodeGenieConfig } from './config.js'
import { getOpenIdClient } from './openid-client.js'

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://api.codegenie.codes'
axios.defaults.baseURL = API_ENDPOINT

export class UnauthException extends Error {
  constructor(causeError: any) {
    super('Unauthorized. Try logging in again with `npx @codegenie/cli login`.', { cause: causeError })
  }
}

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.status === 401) {
      throw new UnauthException(error)
    }
    return error
  }
)

const debug = createDebug('codegenie:AuthCommand')

debug('API_ENDPOINT %s', API_ENDPOINT)

export abstract class AuthCommand extends Command {
  // @ts-expect-error CLI errors out if there's no current config
  public codeGenieConfig: CodeGenieConfig
  public async init(): Promise<void> {
    await super.init()
    await this.refreshToken()
    axios.defaults.headers.common.Authorization = `Bearer ${this.codeGenieConfig.tokens.idToken}`
    debug('Authorization header: %s', axios.defaults.headers.common.Authorization)
  }

  async refreshToken() {
    const debug = createDebug('codegenie:AuthCommand:refreshToken')
    const codeGenieConfig = await this.getCurrentConfig()
    debug('codeGenieConfig: %O', codeGenieConfig)
    const inOneMinute = Date.now() - 60_000
    const tokenExpiresInLessThanOneMinute = codeGenieConfig.tokens.expiresAt < inOneMinute
    debug({
      expiresAt: codeGenieConfig.tokens.expiresAt,
      inOneMinute,
      tokenExpiresInLessThanOneMinute,
    })

    if (tokenExpiresInLessThanOneMinute) {
      debug('refreshing')
      const openIdClient = await getOpenIdClient()
      const tokenSet = await openIdClient.refresh(codeGenieConfig.tokens.refreshToken)
      codeGenieConfig.tokens = {
        ...codeGenieConfig.tokens,
        idToken: tokenSet.id_token!,
        accessToken: tokenSet.access_token!,
        expiresAt: tokenSet.expires_at!,
      }
      debug('codeGenieConfig: %O', codeGenieConfig)
      updateCodeGenieConfig(codeGenieConfig)
    }

    this.codeGenieConfig = codeGenieConfig
  }

  async getCurrentConfig() {
    const codeGenieConfig = getCodeGenieConfig()

    if (!codeGenieConfig) {
      this.error('Not logged in', {
        code: 'NOT_LOGGED_IN',
        suggestions: ['Run `npx @codegenie/cli login`', "If you don't have an account yet, first register at https://app.codegenie.codes"],
      })
    }

    return codeGenieConfig
  }
}
