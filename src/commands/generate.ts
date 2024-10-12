import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { Flags, ux } from '@oclif/core'
import axios, { AxiosError } from 'axios'
import AdmZip from 'adm-zip'
import { cosmiconfig } from 'cosmiconfig'
import createDebug from 'debug'
import { execSync } from 'node:child_process'
import { cwd } from 'node:process'
import { dirname, extname, join, resolve } from 'node:path'
import { inspect } from 'node:util'
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { awsCredentialsFileExists } from '../aws-creds.js'
import sleep from '../sleep.js'
import { AppDefinition } from '../input/types.js'
import { AuthCommand, UnauthException } from '../AuthCommand.js'
const __dirname = dirname(fileURLToPath(import.meta.url))

const debug = createDebug('codegenie:generate')
const appDir = cwd()
const dotCodeGenieDir = join(appDir, '.codegenie')

const explorer = cosmiconfig('codegenie', {
  searchPlaces: [`.codegenie/app.js`, `.codegenie/app.ts`, `.codegenie/app.mjs`, `.codegenie/app.cjs`],
})

const APP_DEFINITION_GENERATOR_FUNCTION_URL = `/app-definition-generator`
// const APP_DEFINITION_GENERATOR_FUNCTION_URL =
//   process.env.APP_DEFINITION_GENERATOR_FUNCTION_URL || 'https://odmef7ae4hmt2cglbfzooqgxg40ltjfn.lambda-url.us-west-2.on.aws/'

export default class Generate extends AuthCommand {
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
    name: Flags.string({ char: 'n', description: "Name of the app you're generating." }),
    description: Flags.string({
      char: 'd',
      description:
        'Describe your application in plain English and Code Genie will do its best to create an App Definition and data model for you.',
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
    idp: Flags.string({
      description:
        'Supported identity providers. Valid values include "Google" and "SAML". Can be specified multiple times to enable multiple IDPs.',
      required: false,
      multiple: true,
    }),
  }

  async run(): Promise<{ description?: string; deploy: boolean; awsProfileToCopy: string }> {
    const { flags } = await this.parse(Generate)
    const { name, description, deploy, awsProfileToCopy, generateAppDefinitionOnly } = flags

    if (description && description.length > 500) {
      this.error('Description must be less than 500 characters.', {
        code: 'DESCRIPTION_TOO_LONG',
        suggestions: ['Try again with a shorter description.'],
      })
    }

    // If a description is provided we create a new directory using the name provided (--name)
    // and generate an App Definition (.codegenie directory) within it based on the description
    if (description) {
      // First check if we're within an existing Code Genie project directory by checking if a .codegnie directory already exists.
      // handleExistingAppDefinition MUST be run before generateAppDefinition, since generateAppDefinition creates a .codegenie directory.
      const hasExistingAppDefinition = await this.handleExistingAppDefinition()

      if (!hasExistingAppDefinition && !name) {
        this.error('No app name provided.', {
          code: 'NO_APP_NAME',
          suggestions: ['Re-run the commnand with a `--name "Awsome App`'],
        })
      }

      const appName = name || (await this.getAppName())
      await this.generateAppDefinition({ appName })

      if (generateAppDefinitionOnly) {
        this.log(`The app definition has successfully been generated 🎉`)
        return {
          description,
          deploy,
          awsProfileToCopy,
        }
      }
    } else if (!existsSync(dotCodeGenieDir)) {
      this.error(
        "No .codegenie directory found. Make sure you're running this command inside a directory that has a child .codegenie directory.",
        {
          code: 'APP_DEFINITION_DIR_NOT_FOUND',
          suggestions: [
            'Run the generate command within a directory that has a .codegenie directory inside it.',
            'Run the generate command with a `--description "detailed description of app"` to generate a starter point for your app definition.',
          ],
        }
      )
    }

    const { outputPresignedUrl } = await this.generateApp()

    await this.downloadProject({ outputPresignedUrl })

    this.log(`🎉 Your project was successfully generated 🎉

Run \`npm run init:dev\` to get started. See https://codegenie.codes/docs/guides/getting-started/#initialize-app-and-deploy-to-aws for more details.`)

    if (deploy) {
      if (awsCredentialsFileExists()) {
        await this.runInitDev()
      } else {
        this.log(
          `The project wasn't able to be automatically built and deployed to AWS because the AWS CLI isn't set up on this machine. Install the AWS CLI and then run \`npm run init:dev\`.`
        )
      }
    }

    return {
      description,
      deploy,
      awsProfileToCopy,
    }
  }

  async getAppDefinition() {
    const appDefinitionConfig = await explorer.search(appDir)
    const appDefinition: AppDefinition = appDefinitionConfig?.config

    if (!appDefinition) {
      this.error('No App Definition found at .codegenie/app.[ts|js].', {
        code: 'APP_DEFINITION_NOT_FOUND',
        suggestions: [
          'Check that you are within the correct directory that contains your .codegenie directory',
          'Run npx `@codegenie/cli --description "..."` to create a new app based on a description',
          'Manually create an App Definition file at .codegenie/app.ts',
        ],
      })
    }

    return appDefinition
  }

  async getAppName() {
    const appDefinition: AppDefinition = await this.getAppDefinition()

    if (!appDefinition.name) {
      this.error('No name defined in .codegenie/app.ts.', {
        code: 'APP_DEFINITION_NO_NAME',
        suggestions: ['Add a name property to the App Definition.'],
      })
    }

    return appDefinition.name
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
   * @param root0
   * @param root0.appName
   */
  async generateAppDefinition({ appName }: { appName: string }): Promise<{ appName: string; appDescription: string }> {
    const debug = createDebug('codegenie:generate:generateAppDefinition')
    const { flags } = await this.parse(Generate)
    const { description, idp } = flags

    ux.action.start('🧞  Generating App Definition. This may take a minute')

    let generateAppDefinitionResponse
    try {
      generateAppDefinitionResponse = await axios.post(APP_DEFINITION_GENERATOR_FUNCTION_URL, {
        name: appName,
        description,
        idps: idp,
      })
      debug('generateAppDefinitionResponse %O', generateAppDefinitionResponse.data)
    } catch (error: any) {
      debug(error)
      if (error instanceof UnauthException) {
        this.error('Unauthorized.', {
          code: 'GENERATE_APP_UNAUTHORIZED',
          suggestions: [
            'Try logging in again with `npx @codegenie/cli login`',
            'Report the error in the Code Genie Discord Server listed on https://codegenie.codes or contact support@codegenie.codes.',
          ],
          message: error.message,
        })
      }
      this.error(
        "There was an error while generating the App Definition. This is usually due to the AI not understanding the app description. Try to keep the description focused on the kind of data that your app deals with, rather than the custom business logic requirements. Code Genie creates project foundations based on data models, and doesn't add custom business logic (yet).",
        {
          code: 'GENERATE_APP_DEFINITION_FAILED',
          suggestions: [
            'Try again with a different description.',
            'Report the error in the Code Genie Discord Server listed on https://codegenie.codes or contact support@codegenie.codes.',
          ],
          message: error.message,
        }
      )
    }

    ux.action.start('🧞  Creating a new Code Genie App')

    try {
      const logo = await this.getLogo()
      const createAppResponse = await axios.post('/apps', {
        appDefinition: generateAppDefinitionResponse.data.appDefinition,
        logo,
      })

      await this.writeGeneratedAppDefinitionFile({
        appDefinition: {
          appId: createAppResponse.data.data.appId,
          ...generateAppDefinitionResponse.data.appDefinition,
        },
      })
      debug('createAppResponse %O', createAppResponse.data)
      ux.action.stop('✅')
    } catch (error: any) {
      debug(error)
      this.error('There was an error while creating the Code Genie App.', {
        code: 'CREATE_APP_FAILED',
        suggestions: [
          'Try again with a different description.',
          'Report the error in the Code Genie Discord Server listed on https://codegenie.codes or contact support@codegenie.codes.',
        ],
        message: error.message,
      })
    }

    ux.action.stop('✅')
    return {
      appName,
      appDescription: description!,
    }
  }

  async getLogo() {
    let logo = null
    try {
      const logoPath = join(dotCodeGenieDir, 'logo.png')
      const logoBuffer = await readFile(logoPath)
      const mimeType = extname(logoPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
      const base64Data = logoBuffer.toString('base64')
      logo = `data:${mimeType};base64,${base64Data}`
    } catch (fileError: any) {
      if (fileError.code === 'ENOENT') {
        console.warn('No logo found. Proceeding without a logo.')
      } else {
        console.error('Error reading logo file:', fileError.message)
      }
    }
    console.log('logo is', logo)
    return logo
  }

  async writeGeneratedAppDefinitionFile({ appDefinition }: { appDefinition: AppDefinition }) {
    const codeGenieDir = dotCodeGenieDir
    if (!existsSync(codeGenieDir)) {
      await mkdir(codeGenieDir)
    }

    writeFileSync(
      join(codeGenieDir, 'app.ts'),
      `import type { AppDefinition } from '@codegenie/cli'

const codeGenieAppDefinition: AppDefinition = ${inspect(appDefinition, { depth: 8, compact: false })}

export default codeGenieAppDefinition
`
    )
    await this.copyCodeGenieLogo()
  }

  async addAppIdToAppDefinitionFile({ appId }: { appId: string }) {
    const codeGenieDir = dotCodeGenieDir
    const appDefinitionFilePath = join(codeGenieDir, 'app.ts')
    const appDefinitionFileContents = readFileSync(appDefinitionFilePath, { encoding: 'utf8' })
    const appDefinitionFileContentsWithAppId = appDefinitionFileContents.replace(
      'name:',
      `appId: '${appId}',
  name:`
    )

    writeFileSync(appDefinitionFilePath, appDefinitionFileContentsWithAppId)
  }

  async createZip(directoryPath: string) {
    const zip = new AdmZip()
    zip.addLocalFolder(directoryPath)
    const newZipBuffer = await zip.toBufferPromise()
    return newZipBuffer
  }

  /**
   * Uploads App Definition .codegenie directory to S3, which kicks off an app build
   */
  async generateApp() {
    const debug = createDebug('codegenie:generate:generateApp')
    ux.action.start('⬆️📦 Generating App')
    const appDefinition = await this.getAppDefinition()

    let { appId } = appDefinition

    if (!appId) {
      try {
        const logo = await this.getLogo()
        const createAppResponse = await axios.post('/apps', {
          appDefinition,
          logo,
        })
        debug('createAppResponse %O', createAppResponse)
        appId = createAppResponse.data.data.appId as string
      } catch (error: any) {
        const errorMessage = error instanceof AxiosError ? error.response?.data.message : error.message
        this.error('Error while creating app.', {
          code: 'CREATE_APP_FAILED',
          suggestions: [],
          message: errorMessage,
        })
      }

      this.addAppIdToAppDefinitionFile({ appId })
    }

    try {
      const generateAppResponse = await axios.post(`/apps/${appId}/builds`, { appDefinition })
      debug('generateAppResponse %O', generateAppResponse)
      const { outputPresignedUrl } = generateAppResponse.data
      ux.action.stop('✅')
      return {
        outputPresignedUrl,
      }
    } catch (error: any) {
      const errorMessage = error instanceof AxiosError ? error.response?.data.message : error.message
      console.error({ errorMessage })
      this.error('Error while generating app.', {
        code: 'GENERATE_APP_FAILED',
        suggestions: [],
        message: errorMessage,
      })
    }
  }

  async pollS3ObjectExistence({
    headObjectPresignedUrl,
    interval,
    timeout,
    startTime = Date.now(),
    attempt = 1,
  }: {
    headObjectPresignedUrl: string
    interval: number
    timeout: number
    startTime?: number
    attempt?: number
  }) {
    const debug = createDebug('codegenie:generate:pollS3ObjectExistence')
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

          await this.pollS3ObjectExistence({ headObjectPresignedUrl, startTime, attempt: attempt + 1, interval, timeout })
          return
        }
      }

      debug(error.message)

      this.error(`Received unexpected error while checking if the app had finished generating.`, {
        code: 'POLLING_APP_UNEXPECTED_ERROR',
        suggestions: ['Try again.', 'Report error to discord server or GitHub'],
      })
    }
  }

  async downloadProject({ outputPresignedUrl }: { outputPresignedUrl: string }): Promise<undefined> {
    ux.action.start('⬇️📦 Downloading App')
    debug('outputPresignedUrl %s', outputPresignedUrl)
    const response = await axios.get(outputPresignedUrl, {
      responseType: 'arraybuffer',
      headers: { Authorization: undefined }, // don't include the JWT authorization header
    })
    const zip = new AdmZip(response.data)
    const overwrite = true
    zip.extractAllTo(appDir, overwrite)
    ux.action.stop('✅')
  }

  async runInitDev(): Promise<undefined> {
    this.log(`The first deploy may take up to 10 minutes, but you can start exploring your project's source code now!`)
    ux.action.start('🌩️   Deploying to AWS')
    execSync('npm run init:dev', {
      stdio: 'inherit',
      cwd: appDir,
    })
    ux.action.stop('✅')
  }

  async copyCodeGenieLogo() {
    const debug = createDebug('codegenie:generate:copyCodeGenieLogo')
    const codeGenieLogoPath = resolve(__dirname, '../../logo.png')
    const appCodeGenieDir = dotCodeGenieDir
    debug('copying logo from %s to %s', codeGenieLogoPath, appCodeGenieDir)
    await copyFile(codeGenieLogoPath, join(appCodeGenieDir, 'logo.png'))
    debug('complete')
  }
}
