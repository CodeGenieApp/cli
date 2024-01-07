import { existsSync, rmSync } from 'node:fs'
import { Flags } from '@oclif/core'
import { AuthCommand } from '../AuthCommand.js'

export default class Generate extends AuthCommand {
  public static enableJsonFlag = true
  static summary = 'Generate an application'
  static description = 'Generate an application based on a description'
  static aliases = ['generate']

  static examples = [
    `<%= config.bin %> <%= command.id %> --description "A to-do list application called getitdone" --deploy
generating app...

<%= config.bin %> <%= command.id %> --description "A banking app" --deploy
generating app...
`,
  ]

  static flags = {
    name: Flags.string({ description: "Name of the app you're generating." }),
    description: Flags.string({
      description: 'Describe your application in plain English and Code Genie will do its best to create a data model for you.',
    }), // TODO: required if useDataModel is false
    deploy: Flags.boolean({
      char: 'd',
      description:
        'Deploys the generated application to AWS using the --deployProfile creds. Creates new profiles in ~/.aws/credentials based on your app name and stages by copying the --deployProfile creds.',
      required: false,
      default: false,
    }),
    deployProfile: Flags.string({
      char: 'p',
      description: 'The AWS Profile (defined in ~/.aws/credentials) to use when deploying the application.',
      default: 'default',
    }),
    replaceDataModel: Flags.boolean({
      char: 'r',
      description: 'Replaces the current .codegenie directory',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<undefined | { description?: string; deploy: boolean; deployProfile: string }> {
    const { flags } = await this.parse(Generate)
    const { description, deploy, deployProfile } = flags

    await this.handleExistingCodeGenieDir()

    // TODO: If no appId defined in app.yaml, create App in DB and update app.yaml with appId.

    // TODO: Create Build in DB with current timestamp. Returns presigned URL for uploading.

    await this.uploadCodeGenieDir()
    await this.pollForS3OutputObject()
    await this.runInitDev()

    this.log(`Your app description is: ${description}. Deploy: ${deploy}; Profile: ${deployProfile}`)

    return {
      description,
      deploy,
      deployProfile,
    }
  }

  /**
   * Checks if a .codegenie directory already exists so that it doesn't accidentally get overwritten.
   *
   * Users can specify --replace-data-model if they would prefer to ignore this and replace the directory.
   */
  async handleExistingCodeGenieDir(): Promise<undefined> {
    const { flags } = await this.parse(Generate)
    const { description, replaceDataModel } = flags

    // No description flag means we're not generating a .codegenie and will be uploading the existing one, so we can succeed here
    if (!description || !existsSync('.codegenie')) return

    if (replaceDataModel) {
      rmSync('.codegenie', { recursive: true, force: true })
      return
    }

    this.error('A .codegenie directory already exists.', {
      code: 'CODEGENIE_DIR_EXISTS',
      suggestions: [
        'If you want to regenerate based on the existing data model defined in .codegenie: run the same command again without the `--description` flag.',
        "If you'd rather replace the existing .codegenie directory with a new AI-generated data model, re-run the command again with the `--replace-data-model` flag.",
      ],
    })
  }

  /**
   * TODO:
   */
  async uploadCodeGenieDir(): Promise<undefined> {
    // Uploads .codegenie directory (1MB size limit) to S3: apps/appId/timestamp/input.zip (use timestamp from Build record)
    // S3 triggers Lambda to run generator and uploads generated output zip to S3: apps/appId/timestamp/output.zip
    return undefined
  }

  /**
   * TODO:
   */
  async pollForS3OutputObject(): Promise<undefined> {
    // Polls API /apps/appId/builds/buildId for existence. Returns presigned URL to download output.zip from S3 and extracts.
    return undefined
  }

  /**
   * TODO:
   */
  async runInitDev(): Promise<undefined> {
    // Runs npm run init:dev. Passes through flags such as which profile to copy.
    return undefined
  }
}
