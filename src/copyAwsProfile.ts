import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { paramCase } from './string-utils.js'

export default function copyAwsProfile({ appName }: { appName: string }) {
  const awsCredentialsFile = path.resolve(os.homedir(), '.aws/credentials')
  const awsCredentials = fs.readFileSync(awsCredentialsFile, 'utf8')
  const newProfileNameWithoutEnvSuffix = paramCase(appName)
  const newDevProfileName = `${newProfileNameWithoutEnvSuffix}_dev`
  const newStagingProfileName = `${newProfileNameWithoutEnvSuffix}_staging`
  const newProdProfileName = `${newProfileNameWithoutEnvSuffix}_prod`

  if (awsCredentials.includes(`[${newDevProfileName}]`)) return

  const profileToCopy = 'default'
  const [, profileToCopySplit] = awsCredentials.split(`[${profileToCopy}]`)
  const [profileToCopyCreds] = profileToCopySplit.split(/\[.*]/)
  const profileToCopyCredsNewlineCleaned = profileToCopyCreds.replace('\n\n', '\n')
  fs.appendFileSync(
    awsCredentialsFile,
    `

[${newDevProfileName}]${profileToCopyCredsNewlineCleaned}
[${newStagingProfileName}]${profileToCopyCredsNewlineCleaned}
[${newProdProfileName}]${profileToCopyCredsNewlineCleaned}`
  )
}
