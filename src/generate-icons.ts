import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FaviconFile, FaviconImage, favicons } from 'favicons'
import { existsSync } from 'node:fs'
import createDebug from 'debug'

const debug = createDebug('codegenie:generate-icons')
export async function generateIcons({ appDir }: { appDir: string }) {
  const appDefinitionLogoPath = path.join(appDir, '.codegenie/logo.png')

  if (!existsSync(appDefinitionLogoPath)) {
    debug('no logo found at %s', appDefinitionLogoPath)
    return
  }

  const iconsDirName = 'icons'
  const favIconsConfig = {
    path: iconsDirName,
  }
  const faviconsResponse = await favicons(appDefinitionLogoPath, favIconsConfig)
  const publicPath = path.join(appDir, 'packages/ui/public')
  const publicIconsPath = path.join(publicPath, iconsDirName)
  await mkdir(publicIconsPath, { recursive: true })
  const promises = [
    ...faviconsResponse.images.map((image: FaviconImage) => writeFile(path.join(publicIconsPath, image.name), image.contents, 'binary')),
    ...faviconsResponse.files.map((file: FaviconFile) => writeFile(path.join(publicIconsPath, file.name), file.contents, 'binary')),
    writeFile(path.join(publicIconsPath, 'index.html'), faviconsResponse.html.join('\n'), 'binary'),
    copyFile(appDefinitionLogoPath, path.join(publicPath, 'logo.png')),
  ]
  await Promise.all(promises)
  await copyFile(path.join(publicIconsPath, 'favicon.ico'), path.join(publicPath, 'favicon.ico'))
}
