import { AppDefinition } from './input/types.js'

export function convertCliAppDefinitionToDatabaseModel({ appDefinition }: { appDefinition: AppDefinition }) {
  const convertedAppDefinition: any = JSON.parse(JSON.stringify(appDefinition))

  flattenObjectProperty(convertedAppDefinition, 'theme')
  flattenObjectProperty(convertedAppDefinition, 'auth')
  for (const entityName of Object.keys(convertedAppDefinition.entities)) {
    flattenObjectProperty(convertedAppDefinition.entities[entityName], 'ui')
    for (const propertyName of Object.keys(convertedAppDefinition.entities[entityName].properties)) {
      flattenObjectProperty(convertedAppDefinition.entities[entityName].properties[propertyName], 'ui')
    }
  }

  delete convertedAppDefinition.ignoreOutputPaths
  delete convertedAppDefinition.entities

  return convertedAppDefinition
}

function flattenObjectProperty(obj: any, objectKey: string) {
  for (const [k, v] of Object.entries(obj[objectKey])) {
    const kUpper = capitalizeFirstLetter(k)
    obj[`${objectKey}${kUpper}`] = v
  }

  delete obj[objectKey]
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
