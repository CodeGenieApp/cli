import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { favicons } from 'favicons'
import { existsSync } from 'node:fs'
import createDebug from 'debug'

const debug = createDebug('codegenie:generate-icons')
export async function generateIcons({ appDir }: { appDir: string }) {
  const appDefinitionLogoPath = path.join(appDir, '.codegenie/logo.png')

  if (!existsSync(appDefinitionLogoPath)) {
    debug('no logo found at %s', appDefinitionLogoPath)
    return
  }

  const faviconsDirName = 'icons'
  const favIconsConfig = {
    path: faviconsDirName,
  }
  const faviconsResponse = await favicons(appDefinitionLogoPath, favIconsConfig)
  const publicPath = path.join(appDir, 'packages/ui/public')
  copyFile(appDefinitionLogoPath, path.join(publicPath, 'logo.png'))
  const favIconsDir = path.join(publicPath, faviconsDirName)
  await mkdir(favIconsDir, { recursive: true })
  const promises = [
    ...faviconsResponse.images.map((image: any) => writeFile(path.join(publicPath, faviconsDirName, image.name), image.contents, 'binary')),
    ...faviconsResponse.files.map((file: any) => writeFile(path.join(publicPath, faviconsDirName, file.name), file.contents, 'binary')),
    writeFile(path.join(publicPath, faviconsDirName, 'index.html'), faviconsResponse.html.join('\n'), 'binary'),
    copyFile(path.join(favIconsDir, 'favicon.ico'), path.join(publicPath, 'favicon.ico')),
  ]
  await Promise.all(promises)
}
