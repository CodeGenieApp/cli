import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const awsCredentialsFilePath = path.resolve(os.homedir(), '.aws/credentials')

export function awsCredentialsFileExists() {
  return fs.existsSync(awsCredentialsFilePath)
}
