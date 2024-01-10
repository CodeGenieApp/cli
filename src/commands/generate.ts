import { existsSync, rmSync } from 'node:fs'
import { Command, Flags, ux } from '@oclif/core'
import axios from 'axios'
import { cosmiconfig } from 'cosmiconfig'

import codeGenieSampleOpenAiOutputJson from '../sample-api-output.js'
import { App, convertOpenAiOutputToCodeGenieInput } from '../app-definition-generator.js'
import copyAwsProfile from '../copyAwsProfile.js'
const explorer = cosmiconfig('codegenie', {
  searchPlaces: [
    `.codegenie/app`,
    `.codegenie/app.json`,
    `.codegenie/app.yaml`,
    `.codegenie/app.yml`,
    `.codegenie/app.js`,
    `.codegenie/app.ts`,
    `.codegenie/app.mjs`,
    `.codegenie/app.cjs`,
    `.config/codegenie/app`,
    `.config/codegenie/app.json`,
    `.config/codegenie/app.yaml`,
    `.config/codegenie/app.yml`,
    `.config/codegenie/app.js`,
    `.config/codegenie/app.ts`,
    `.config/codegenie/app.mjs`,
    `.config/codegenie/app.cjs`,
  ],
})

axios.defaults.baseURL = 'http://localhost:4911'

export default class Generate extends Command {
  public static enableJsonFlag = true
  static summary = 'Generate an application'
  static description = 'Generate an application based on a description or a App Definition defined in .codegenie'
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
      char: 'd',
      description: 'Describe your application in plain English and Code Genie will do its best to create an App Definition and data model for you.',
    }),
    deploy: Flags.boolean({
      description:
        'Deploys the generated application to AWS using the --awsProfileToCopy creds. Creates new profiles in ~/.aws/credentials based on your app name and stages by copying the --awsProfileToCopy creds.',
      required: false,
      default: true,
    }),
    awsProfileToCopy: Flags.string({
      char: 'p',
      description:
        "The AWS Profile to copy in the ~/.aws/credentials file and used to deploy the application. Defaults to the 'default' profile. Specify --no-copy-aws-profile to skip this step",
      default: 'default',
    }),
    noCopyAwsProfile: Flags.boolean({
      char: 'n',
      description:
        'Skips copying an AWS profile in the ~/.aws/credentials file. You must specify a your-app-name_dev (as well as _staging and _prod) profile before you can deploy the app.',
      required: false,
      default: false,
    }),
    replaceAppDefinition: Flags.boolean({
      char: 'r',
      description: 'Replaces the current .codegenie directory.',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<{ description?: string; deploy: boolean; awsProfileToCopy: string }> {
    const { flags } = await this.parse(Generate)
    const { description, deploy, awsProfileToCopy, noCopyAwsProfile } = flags

    // If a description is provided we generate an App Definition .codegenie directory based on it
    if (description) {
      await this.handleExistingAppDefinition()
      await this.generateAppDefinition()
    }

    // TODO: If no appId defined in app.yaml, create App in DB and update app.yaml with appId.

    // TODO: Create Build in DB with current timestamp. Returns presigned URL for uploading.

    await this.uploadAppDefinition()
    await this.pollForS3OutputObject()

    if (!noCopyAwsProfile) {
      const appDefinition = await explorer.search()
      await ux.wait(2500)
      copyAwsProfile({ appName: appDefinition?.config.title })
    }

    if (deploy) {
      await this.runInitDev()
    }

    this.log(`Your app description is: ${description}. Deploy: ${deploy}; Profile: ${awsProfileToCopy}`)

    return {
      description,
      deploy,
      awsProfileToCopy,
    }
  }

  /**
   * Checks if a .codegenie directory already exists so that it doesn't accidentally get overwritten.
   *
   * Users can specify --replace-app-definition if they would prefer to ignore this and replace the directory.
   * @throws When a .codegenie directory exists and --replace-app-definition wasn't specified
   */
  async handleExistingAppDefinition() {
    const { flags } = await this.parse(Generate)
    const { replaceAppDefinition } = flags

    if (!existsSync('.codegenie')) return

    if (replaceAppDefinition) {
      ux.action.start('Deleting .codegenie')
      rmSync('.codegenie', { recursive: true, force: true })
      ux.action.stop('✅')
      return
    }

    this.error('A .codegenie directory already exists.', {
      code: 'CODEGENIE_DIR_EXISTS',
      suggestions: [
        'If you want to regenerate based on the existing App Definition defined in .codegenie: run the same command again without the `--description` flag.',
        "If you'd rather replace the existing .codegenie directory with a new AI-generated App Definition, re-run the command again with the `--replace-app-definition` flag.",
      ],
    })
  }

  /**
   * Generates a [.codegenie app definition](https://codegenie.codes/docs) based on the provided description
   */
  async generateAppDefinition(): Promise<App> {
    const { flags } = await this.parse(Generate)
    const { description, name } = flags
    //     this.log(`Generating .codegenie app definition based on the following description:

    // ${description}
    // `)
    ux.action.start('🧞  Generating App Definition')
    // const output = await axios.post('/app-definition-generator', {
    //   name,
    //   description,
    // })
    // const app = output.data.data
    const app = codeGenieSampleOpenAiOutputJson as unknown as App
    convertOpenAiOutputToCodeGenieInput({
      app,
      appName: name,
      appDescription: description!,
    })
    ux.action.stop('✅')
    return app
  }

  /**
   * Uploads App Definition .codegenie directory to S3, which kicks off an app build
   */
  async uploadAppDefinition() {
    ux.action.start('⬆️📦 Uploading App Definition')
    //  (1MB size limit) to S3: apps/appId/timestamp/input.zip (use timestamp from Build record)
    // S3 triggers Lambda to run generator and uploads generated output zip to S3: apps/appId/timestamp/output.zip
    // ux.action.status = 'still going'
    ux.action.stop('✅')
  }

  /**
   * TODO:
   */
  async pollForS3OutputObject(): Promise<undefined> {
    ux.action.start('🏗️   Generating project')
    ux.action.stop('✅')
    ux.action.start('⬇️📦 Downloading project')
    ux.action.stop('✅')
    // Polls API /apps/appId/builds/buildId for existence. Returns presigned URL to download output.zip from S3 and extracts.
  }

  /**
   * TODO:
   */
  async runInitDev(): Promise<undefined> {
    ux.action.start('🌩️   Initializing project')
    // await ux.wait(2500)
    ux.action.stop('✅')
    // Runs npm run init:dev. Passes through flags such as which profile to copy.
  }
}
