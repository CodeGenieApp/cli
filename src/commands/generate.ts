import { createReadStream, existsSync, rmSync, statSync } from 'node:fs'
import { Command, Flags, ux } from '@oclif/core'
import axios, { AxiosError } from 'axios'
import AdmZip from 'adm-zip'
import { cosmiconfig } from 'cosmiconfig'
import codeGenieSampleOpenAiOutputJson from '../sample-api-output.js'
import { App, convertOpenAiOutputToCodeGenieInput } from '../app-definition-generator.js'
import copyAwsProfile from '../copyAwsProfile.js'
import path from 'node:path'
import sleep from '../sleep.js'
import { execSync } from 'node:child_process'
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

// axios.defaults.baseURL = 'http://localhost:4911'
axios.defaults.baseURL = 'https://r0jmyp0py4.execute-api.us-west-2.amazonaws.com'

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

    if (description && description.length > 500) {
      this.error('description must be less than 500 characters.', {
        code: 'DESCRIPTION_TOO_LONG',
        suggestions: ['Try again with a shorter description.'],
      })
    }

    // If a description is provided we generate an App Definition .codegenie directory based on it
    if (description) {
      await this.handleExistingAppDefinition()
      await this.generateAppDefinition()
    }

    const { headObjectPresignedUrl, getObjectPresignedUrl } = await this.uploadAppDefinition()
    await this.downloadS3OutputObject({
      headObjectPresignedUrl,
      getObjectPresignedUrl,
    })

    if (!noCopyAwsProfile) {
      const appDefinition = await explorer.search()
      const appName = appDefinition?.config.title

      if (!appName) {
        this.error('No title defined in .codegenie/app.yml.', {
          code: 'APP_YML_NO_TITLE',
          suggestions: ['Add a title property to the root of .codegenie/app.yml.'],
        })
      }

      copyAwsProfile({ appName: appDefinition?.config.title })
    }

    if (deploy) {
      await this.runInitDev()
    }

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
  async generateAppDefinition(): Promise<void | App> {
    const { flags } = await this.parse(Generate)
    const { description, name } = flags
    //     this.log(`Generating .codegenie app definition based on the following description:

    // ${description}
    // `)
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
      return
    }

    convertOpenAiOutputToCodeGenieInput({
      app,
      appName: name,
      appDescription: description!,
    })
    ux.action.stop('✅')
    return app
  }

  async createZip(directoryPath: string, zipFilePath: string) {
    const zip = new AdmZip()
    zip.addLocalFolder(directoryPath)
    // const newZipBuffer = await zip.toBufferPromise()
    await zip.writeZipPromise(zipFilePath)
    // return newZipBuffer
  }

  /**
   * Uploads App Definition .codegenie directory to S3, which kicks off an app build
   */
  async uploadAppDefinition() {
    ux.action.start('⬆️📦 Uploading App Definition')
    const output = await axios.get('/build-upload-presigned-url')
    const { putObjectPresignedUrl, headObjectPresignedUrl, getObjectPresignedUrl } = output.data.data
    const zipFilePath = path.join('.codegenie', '.codegenie.zip')

    await this.createZip('.codegenie', zipFilePath)

    const zipFileStats = statSync(zipFilePath)
    const zipFileSizeBytes = zipFileStats.size
    const fileStream = createReadStream(zipFilePath)

    await axios.put(putObjectPresignedUrl, fileStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': zipFileSizeBytes.toString(),
      },
    })

    ux.action.stop('✅')
    return {
      headObjectPresignedUrl,
      getObjectPresignedUrl,
    }
  }

  async pollS3ObjectExistence({ headObjectPresignedUrl, startTime = Date.now() }: { headObjectPresignedUrl: string; startTime?: number }) {
    const timeout = 60_000
    const interval = 2000

    // If timeout is reached, stop polling
    if (Date.now() - startTime >= timeout) {
      this.error('Timed out waiting for app to generate.', {
        code: 'DESCRIPTION_TOO_LONG',
        suggestions: ['Try again with a shorter description.'],
      })
    }

    try {
      // Make a HEAD request to check the existence of the S3 object
      const response = await axios.head(headObjectPresignedUrl)

      // If the response status is 200 (OK), the object exists
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
          // Wait for the specified interval before making the next request
          sleep(interval)

          // Start the recursive polling
          await this.pollS3ObjectExistence({ headObjectPresignedUrl, startTime })
          return
        }
      }

      // Handle errors, e.g., log or ignore
      // console.error(error)
      this.error(`Received unexpected error while checking if the app had finished generating.`, {
        code: 'POLLING_APP_UNEXPECTED_ERROR',
        suggestions: ['Try again.', 'Report error to discord server or GitHub'],
      })
    }
  }

  async downloadS3OutputObject({
    headObjectPresignedUrl,
    getObjectPresignedUrl,
  }: {
    headObjectPresignedUrl: string
    getObjectPresignedUrl: string
  }): Promise<undefined> {
    ux.action.start('🏗️   Generating project')
    await this.pollS3ObjectExistence({ headObjectPresignedUrl })
    ux.action.stop('✅')
    ux.action.start('⬇️📦 Downloading project')
    const response = await axios.get(getObjectPresignedUrl, { responseType: 'arraybuffer' })
    const zip = new AdmZip(response.data)
    const overwrite = false
    zip.extractAllTo('.', overwrite)
    ux.action.stop('✅')
  }

  async runInitDev(): Promise<undefined> {
    ux.action.start('🌩️   Initializing project')
    execSync('npm run init:dev')
    ux.action.stop('✅')
  }
}
