import { Command } from '@oclif/core'
import pkceChallenge from 'pkce-challenge'

export abstract class AuthCommand extends Command {
  public async init(): Promise<void> {
    await super.init()
    this.checkAuth()
  }

  async checkAuth(): Promise<undefined> {
    const challenge = await pkceChallenge()
    console.log(challenge)

    return undefined
  }
}
