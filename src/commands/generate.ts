import { existsSync, rmSync } from 'node:fs'
import { Command, Flags, ux } from '@oclif/core'
import axios, { AxiosError } from 'axios'
import AdmZip from 'adm-zip'
import { cosmiconfig } from 'cosmiconfig'
import createDebug from 'debug'
// import codeGenieSampleOpenAiOutputJson from '../sample-api-output.js'
import { App, convertOpenAiOutputToCodeGenieInput, getAppOutputDir } from '../app-definition-generator.js'
import copyAwsProfile, { awsCredentialsFileExists } from '../copyAwsProfile.js'
import sleep from '../sleep.js'
import { execSync } from 'node:child_process'
import { Readable } from 'node:stream'
import path from 'node:path'
import { cwd } from 'node:process'

const debug = createDebug('generate')

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

axios.defaults.baseURL = process.env.API_ENDPOINT || 'https://api.codegenie.codes'

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
      default: false,
    }),
    awsProfileToCopy: Flags.string({
      char: 'p',
      description:
        "The AWS Profile to copy in the ~/.aws/credentials file and used to deploy the application. Defaults to the 'default' profile. Specify --noCopyAwsProfile to skip this step",
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
    generateAppDefinitionOnly: Flags.boolean({
      description: 'Generates app definition only (run `@codegenie/cli generate` without `--description` to generate source code).',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<{ description?: string; deploy: boolean; awsProfileToCopy: string; appDir: string }> {
    const { flags } = await this.parse(Generate)
    const { description, deploy, awsProfileToCopy, noCopyAwsProfile, generateAppDefinitionOnly } = flags

    if (description && description.length > 500) {
      this.error('description must be less than 500 characters.', {
        code: 'DESCRIPTION_TOO_LONG',
        suggestions: ['Try again with a shorter description.'],
      })
    }

    let appDir = cwd()

    // If a description is provided we create a new directory using the name provided (--name)
    // or the AI-generated name, and generate an App Definition (.codegenie directory) within it based on the description
    if (description) {
      // First check if we're within an existing Code Genie project directory by checking if a .codegnie directory already exists.
      // handleExistingAppDefinition MUST be run before generateAppDefinition, since generateAppDefinition creates a .codegenie directory.
      const hasExistingAppDefinition = await this.handleExistingAppDefinition()
      const generateAppDefinitionResult = await this.generateAppDefinition()

      // Usually we expect that `generate --description` is run NOT within an existing Code Genie project directory; therefore
      // hasExistingAppDefinition will usually be false. If `generate --description` is run within an existing Code Genie project directory,
      // handleExistingAppDefinition will throw unless --replaceAppDefinition is included, in which case we want `appDir` to remain as cwd().
      if (!hasExistingAppDefinition) {
        appDir = getAppOutputDir({ appName: generateAppDefinitionResult.appName })
      }
    }

    if (generateAppDefinitionOnly) {
      return {
        description,
        deploy,
        awsProfileToCopy,
        appDir,
      }
    }

    const { headObjectPresignedUrl, getObjectPresignedUrl } = await this.uploadAppDefinition({ appDir })

    await this.downloadProject({
      headObjectPresignedUrl,
      getObjectPresignedUrl,
      appDir,
    })

    const appName = await this.getAppName({ appDir })
    if (deploy && !awsCredentialsFileExists()) {
      const appDirRelative = getAppOutputDir({ appName, absolute: false })
      this.log(`The project has successfully been generated and downloaded to \`./${appDirRelative}\`.

The project wasn't able to be automatically built and deployed to AWS because the AWS CLI isn\'t set up on this machine. Install the AWS CLI and then run \`npm run init:dev\` inside the \`./${appDirRelative}\` directory.

For now you can open \`./${appDirRelative}\` in your favorite IDE like VS Code. Tip: You may even be able to simply run \`code ./${appDirRelative}\` to open it now.`)

      return {
        description,
        deploy,
        awsProfileToCopy,
        appDir,
      }
    }

    if (!noCopyAwsProfile) {
      copyAwsProfile({ appName })
    }

    if (deploy) {
      await this.runInitDev({ appDir, appName })
    }

    return {
      description,
      deploy,
      awsProfileToCopy,
      appDir,
    }
  }

  async getAppName({ appDir }: { appDir?: string } = {}) {
    const appDefinition = await explorer.search(appDir)
    const appName = appDefinition?.config.title

    if (!appName) {
      this.error('No title defined in .codegenie/app.yml.', {
        code: 'APP_YML_NO_TITLE',
        suggestions: ['Add a title property to the root of .codegenie/app.yml.'],
      })
    }

    return appName
  }

  /**
   * Checks if a .codegenie directory already exists so that it doesn't accidentally get overwritten.
   *
   * Users can specify --replaceAppDefinition if they would prefer to ignore this and replace the directory.
   * @throws When a .codegenie directory exists and --replaceAppDefinition wasn't specified
   */
  async handleExistingAppDefinition() {
    const { flags } = await this.parse(Generate)
    const { replaceAppDefinition } = flags

    if (!existsSync('.codegenie')) return false

    if (replaceAppDefinition) {
      ux.action.start('Deleting .codegenie')
      rmSync('.codegenie', { recursive: true, force: true })
      ux.action.stop('✅')
      return true
    }

    this.error('A .codegenie directory already exists.', {
      code: 'CODEGENIE_DIR_EXISTS',
      suggestions: [
        'If you want to regenerate based on the existing App Definition defined in .codegenie: run the same command again without the `--description` flag.',
        "If you'd rather replace the existing .codegenie directory with a new AI-generated App Definition, re-run the command again with the `--replaceAppDefinition` flag.",
      ],
    })
  }

  /**
   * Generates a [.codegenie app definition](https://codegenie.codes/docs) based on the provided description
   */
  async generateAppDefinition(): Promise<{ app: App; appName: string; appDescription: string }> {
    const { flags } = await this.parse(Generate)
    const { description, name } = flags
    ux.action.start('🧞  Generating App Definition')
    const output = await axios.post('/app-definition-generator', {
      name,
      description,
    })
    const app = output.data.data
    // const app = codeGenieSampleOpenAiOutputJson as unknown as App

    if (!app) {
      this.error("The Genie couldn't grant your wish.", {
        code: 'GENERATE_APP_DEFINITION_FAILED',
        suggestions: [
          'Try again with a different description.',
          'Report the error in the Code Genie Discord Server listed on https://codegenie.codes or contact support@codegenie.codes.',
        ],
      })
    }

    const appName = app.name || name
    convertOpenAiOutputToCodeGenieInput({
      app,
      appName,
      appDescription: description!,
    })
    ux.action.stop('✅')
    return {
      app,
      appName,
      appDescription: description!,
    }
  }

  async createZip(directoryPath: string) {
    const zip = new AdmZip()
    zip.addLocalFolder(directoryPath)
    const newZipBuffer = await zip.toBufferPromise()
    return newZipBuffer
  }

  /**
   * Uploads App Definition .codegenie directory to S3, which kicks off an app build
   * @param root0
   * @param root0.appDir
   */
  async uploadAppDefinition({ appDir }: { appDir: string }) {
    ux.action.start('⬆️📦 Uploading App Definition')
    const appName = await this.getAppName({ appDir })
    const output = await axios.get(`/build-upload-presigned-url?appName=${appName}`)
    const { putObjectPresignedUrl, headObjectPresignedUrl, getObjectPresignedUrl } = output.data.data
    const appDefinitionZip = await this.createZip(path.resolve(appDir, '.codegenie'))
    const zipFileSizeBytes = Buffer.byteLength(appDefinitionZip)
    const readable = getReadableFromBuffer(appDefinitionZip)

    try {
      await axios.put(putObjectPresignedUrl, readable, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Length': zipFileSizeBytes.toString(),
        },
      })
    } catch {
      this.error('Failed uploading app definition', {
        code: 'UPLOAD_APP_DEFINITION_ERROR',
      })
    }

    ux.action.stop('✅')
    return {
      headObjectPresignedUrl,
      getObjectPresignedUrl,
    }
  }

  async pollS3ObjectExistence({
    headObjectPresignedUrl,
    startTime = Date.now(),
    attempt = 1,
  }: {
    headObjectPresignedUrl: string
    startTime?: number
    attempt?: number
  }) {
    const timeout = 60_000
    const interval = 1000

    // If timeout is reached, stop polling
    if (Date.now() - startTime >= timeout) {
      this.error('Timed out waiting for app to generate.', {
        code: 'GENERATE_APP_TIMEOUT',
        suggestions: ['Ask for help on the Discord server (link available on https://codegenie.codes).'],
      })
    }

    try {
      // Make a HEAD request to check the existence of the S3 object
      debug('attempt %d', attempt)
      const response = await axios.head(headObjectPresignedUrl)

      // 200 means the output object exists and we can continue
      if (response.status === 200) {
        return
      }

      this.error(`Received unexpected status code ${response.status} while checking if the app had finished generating.`, {
        code: 'POLLING_APP_UNEXPECTED_STATUS_CODE',
        suggestions: ['Try again.', 'Report error to discord server or GitHub'],
      })
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const status = error.response?.status
        if (status === 403 || status === 404) {
          // Wait before polling again
          await sleep(interval)

          await this.pollS3ObjectExistence({ headObjectPresignedUrl, startTime, attempt: attempt + 1 })
          return
        }
      }

      this.error(`Received unexpected error while checking if the app had finished generating.`, {
        code: 'POLLING_APP_UNEXPECTED_ERROR',
        suggestions: ['Try again.', 'Report error to discord server or GitHub'],
      })
    }
  }

  async downloadProject({
    headObjectPresignedUrl,
    getObjectPresignedUrl,
    appDir,
  }: {
    headObjectPresignedUrl: string
    getObjectPresignedUrl: string
    appDir: string
  }): Promise<undefined> {
    ux.action.start('🏗️   Generating project')
    await this.pollS3ObjectExistence({ headObjectPresignedUrl })
    ux.action.stop('✅')
    ux.action.start('⬇️📦 Downloading project')
    const response = await axios.get(getObjectPresignedUrl, { responseType: 'arraybuffer' })
    const zip = new AdmZip(response.data)
    const overwrite = false
    zip.extractAllTo(appDir, overwrite)
    ux.action.stop('✅')
  }

  async runInitDev({ appDir, appName }: { appDir: string; appName: string }): Promise<undefined> {
    const appDirRelative = getAppOutputDir({ appName, absolute: false })
    this.log(
      `The first deploy may take up to 10 minutes, but you don't have to wait that long to get started! Open \`./${appDirRelative}\` in your favorite IDE like VS Code to explore your project source code. Tip: You may even be able to simply run \`code ./${appDirRelative}\` in a separate terminal to open it.`
    )
    ux.action.start('🌩️   Deploying to AWS')
    execSync('npm run init:dev', {
      stdio: 'inherit',
      cwd: appDir,
    })
    ux.action.stop('✅')
  }
}

function getReadableFromBuffer(buffer: Buffer) {
  const readable = new Readable()
  readable._read = () => {}
  readable.push(buffer, undefined)
  return readable
}
