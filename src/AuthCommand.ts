import { Command } from '@oclif/core'

export abstract class AuthCommand extends Command {
  public async init(): Promise<void> {
    await super.init()
    this.checkAuth()
  }

  async checkAuth() {}
}
