import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { kebabCase } from './string-utils.js'

const awsCredentialsFilePath = path.resolve(os.homedir(), '.aws/credentials')

export function awsCredentialsFileExists() {
  return fs.existsSync(awsCredentialsFilePath)
}

export default function copyAwsProfile({ appName }: { appName: string }) {
  // Backup the credentials file before we touch it just to be safe
  fs.copyFileSync(awsCredentialsFilePath, `${awsCredentialsFilePath}_cg.bak`)

  const awsCredentials = fs.readFileSync(awsCredentialsFilePath, 'utf8')
  const newProfileNameWithoutEnvSuffix = kebabCase(appName)
  const newDevProfileName = `${newProfileNameWithoutEnvSuffix}_development`
  const newStagingProfileName = `${newProfileNameWithoutEnvSuffix}_staging`
  const newProdProfileName = `${newProfileNameWithoutEnvSuffix}_production`

  if (awsCredentials.includes(`[${newDevProfileName}]`)) return

  const profileToCopy = 'default'
  const [, profileToCopySplit] = awsCredentials.split(`[${profileToCopy}]`)
  const [profileToCopyCreds] = profileToCopySplit.split(/\[.*]/)
  const profileToCopyCredsNewlineCleaned = profileToCopyCreds.replace('\n\n', '\n')
  fs.appendFileSync(
    awsCredentialsFilePath,
    `

[${newDevProfileName}]${profileToCopyCredsNewlineCleaned}
[${newStagingProfileName}]${profileToCopyCredsNewlineCleaned}
[${newProdProfileName}]${profileToCopyCredsNewlineCleaned}`
  )
}
