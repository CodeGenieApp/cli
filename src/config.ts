import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { homedir } from 'node:os'
import assign from 'lodash.assign'
import { jwtDecode } from 'jwt-decode'
import createDebug from 'debug'

const debug = createDebug('codegenie:config')
const CONFIG_PATH = resolve(homedir(), '.codegenierc')
debug('CONFIG_PATH %s', CONFIG_PATH)

export interface CodeGenieConfig {
  tokens: {
    idToken: string
    accessToken: string
    refreshToken: string
    expiresAt: number
  }
  user: {
    givenName: string
    userId: string
    orgId: string
    email: string
  }
}

interface JwtPayload {
  email?: string
  given_name?: string
  orgId?: string
  userId?: string
}

export function updateCodeGenieConfig(config: Partial<CodeGenieConfig>): void {
  const debug = createDebug('codegenie:config:updateCodeGenieConfig')
  const currentConfig = getCodeGenieConfig() || {}

  if (config.tokens?.idToken) {
    const decodedIdToken = jwtDecode<JwtPayload>(config.tokens.idToken)
    config.user = {
      givenName: decodedIdToken.given_name!,
      userId: decodedIdToken.userId!,
      orgId: decodedIdToken.orgId!,
      email: decodedIdToken.email!,
    }
  }

  if (config.tokens?.expiresAt) {
    config.tokens.expiresAt *= 1000 // JWT expires_at is in seconds, not ms
  }

  const newConfig = assign({}, currentConfig, config)

  debug('newConfig %O', newConfig)

  writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), { encoding: 'utf8' })
}

export function getCodeGenieConfig(): CodeGenieConfig | null {
  const debug = createDebug('codegenie:config:getCodeGenieConfig')
  try {
    const configString = readFileSync(CONFIG_PATH, { encoding: 'utf8' })
    debug('configString %s', configString)

    return JSON.parse(configString) as CodeGenieConfig
  } catch {
    return null
  }
}
