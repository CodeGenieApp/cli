import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import _s from 'underscore.string'
import { dump as yamlDump } from 'js-yaml'
import { getEntityNameStrings, paramCase } from './string-utils.js'

export interface App {
  entities: AppEntity[]
  name: string
}

export interface AppEntityProperty {
  defaultValue?: string | number | boolean
  description?: string
  enumOptions?: string[]
  foreignKeyEntity?: string
  isIdProperty?: boolean
  isImageProperty?: boolean
  isLongText?: boolean
  isMoney?: boolean
  isNameProperty?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  title?: string
  type: string
}

interface AppEntityProperties {
  [propertyName: string]: AppEntityProperty
}

interface AppEntity {
  belongsTo?: string
  description?: string
  hasMany?: string[]
  name: string
  properties: AppEntityProperties
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OUTPUT_DIR = process.cwd()

function getAppOutputDir({ appName }: { appName: string }) {
  return path.join(OUTPUT_DIR, paramCase(appName))
}

function getCodeGenieDir({ appName }: { appName: string }) {
  return path.join(getAppOutputDir({ appName }), '.codegenie')
}

function getEntitiesDir({ appName }: { appName: string }) {
  return path.join(getCodeGenieDir({ appName }), 'entities')
}

function makeEntitiesDir({ appName }: { appName: string }) {
  const entitiesDir = getEntitiesDir({ appName })
  if (!fs.existsSync(entitiesDir)) {
    fs.mkdirSync(entitiesDir, { recursive: true })
  }
}

interface ConvertOpenAiOutputToCodeGenieInputParams {
  app: App
  appDescription: string
  appName?: string
}

export function convertOpenAiOutputToCodeGenieInput({ app, appName = app.name, appDescription }: ConvertOpenAiOutputToCodeGenieInputParams) {
  makeEntitiesDir({ appName })
  writeAppEntitiesToFileSystem({ app, appName })
  writeAppYamlToFileSystem({ app, appName, appDescription })
  const codeGenieDir = getCodeGenieDir({ appName })
  fs.writeFileSync(
    path.join(codeGenieDir, 'theme.yml'),
    `# https://ant.design/theme-editor
  colorPrimary: '#579ddd'
  `
  )
  copyLogo({ appName })
}

function copyLogo({ appName }: { appName: string }) {
  const codeGenieDir = getCodeGenieDir({ appName })
  const logoPath = path.resolve(__dirname, './logo.png')
  fs.copyFileSync(logoPath, path.join(codeGenieDir, 'logo.png'))
}

function getDefaultAuthRoute({ app }: { app: App }) {
  const firstRootEntity = app.entities.find((entity) => entity.name !== 'User' && getIsRootEntity({ entity }))
  if (!firstRootEntity) return '/account'
  const entityNameStrings = getEntityNameStrings({
    entityName: firstRootEntity.name,
  })
  return `/${entityNameStrings.dasherizedPlural}`
}

function writeAppYamlToFileSystem({ app, appName, appDescription }: { app: App; appName: string; appDescription: string }) {
  const fileName = 'app.yml'
  const entities: string[] = app.entities.map((entity) => _s.camelize(_s.decapitalize(entity.name)))
  const defaultAuthRoute = getDefaultAuthRoute({ app })
  const definitions: any = {}
  for (const entity of app.entities) {
    definitions[_s.camelize(_s.decapitalize(entity.name))] = {
      $ref: `./entities/${paramCase(entity.name)}.yml`,
    }
  }

  const appJsonSchema: any = {
    $schema: 'https://json-schema.org/draft/2019-09/hyper-schema',
    title: app.name,
    description: appDescription, // `${app.name} App`,
    'x-codeGenie': {
      // region: 'us-west-2',
      // permissionModel: 'Global',
      defaultAuthRoute,
      entities,
    },
    definitions,
  }
  const fileContentsYaml = yamlDump(appJsonSchema)
  const filePath = path.join(getCodeGenieDir({ appName }), fileName)
  fs.writeFileSync(filePath, fileContentsYaml)
}

export function getJsonSchemasFromEntities({ app }: { app: App }) {
  return app.entities.map((entity) => {
    const paramCasedEntityName = paramCase(entity.name)
    const fileName = `${paramCasedEntityName}.yml`
    const codeGenieEntityJsonSchema = convertToCodeGenieEntityJsonSchema({
      app,
      entity,
    })

    return {
      entityName: entity.name,
      fileName,
      jsonSchema: codeGenieEntityJsonSchema,
    }
  })
}

function writeAppEntitiesToFileSystem({ app, appName }: { app: App; appName: string }) {
  const entitiesDir = getEntitiesDir({ appName })
  const jsonSchemasFromEntities = getJsonSchemasFromEntities({ app })

  for (const entity of jsonSchemasFromEntities) {
    const fileContentsYaml = yamlDump(entity.jsonSchema)
    fs.writeFileSync(path.join(entitiesDir, entity.fileName), fileContentsYaml)
  }
}

function convertToCodeGenieEntityJsonSchema({ app, entity }: { app: App; entity: AppEntity }) {
  const jsonSchema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: entity.name,
    'x-codeGenie': {
      idProperty: getIdProperty({ entity }),
      nameProperty: getNameProperty({ entity }),
      dynamodb: getDynamoDbSettings({ app, entity }),
    },
    allOf: [
      {
        type: 'object',
        $ref: '#/definitions/attributes',
      },
    ],
    definitions: {
      attributes: {
        // description: `${entity.name} attributes`,
        type: 'object',
        properties: getJsonSchemaProperties({ app, entity }),
        required: getJsonSchemaRequiredProperties({ app, entity }),
        additionalProperties: false,
      },
    },
  }

  const imageProperty = getImageProperty({ entity })
  if (imageProperty) {
    jsonSchema['x-codeGenie'].imageProperty = imageProperty
  }

  if (getIsRootEntity({ entity })) {
    jsonSchema['x-codeGenie'].isRootEntity = true
  }

  const hasManySettings = getHasManySettings({ app, entity })

  if (hasManySettings) {
    jsonSchema['x-codeGenie'].hasMany = hasManySettings
  }

  if (entity.name !== 'User' && isLeafEntity({ app, entity })) {
    jsonSchema['x-codeGenie'].onCreate = 'REMAIN_ON_CURRENT_PAGE'
    jsonSchema['x-codeGenie'].buildDetailsPage = false
  }

  return jsonSchema
}

function getIsRootEntity({ entity }: { entity: AppEntity }) {
  const isRootEntity = entity.name !== 'User' && (!entity.belongsTo || entity.belongsTo === 'User')

  return isRootEntity
  // Alternative:
  // const noEntitiesHasManyOfThisEntity = !getEntitiesThatHasManyOfThisEntity({ app, entity }).length

  // return noEntitiesHasManyOfThisEntity
}

function isLeafEntity({ app, entity }: { app: App; entity: AppEntity }) {
  return !getHasManySettings({ app, entity })
}

function getEntitiesThatHasManyOfThisEntity({ app, entity }: { app: App; entity: AppEntity }) {
  const entitiesThatHasManyOfThisEntity = app.entities.filter((otherEntity) => {
    if (otherEntity.name === entity.name) return false
    const otherEntityHasManyOfThisEntity = otherEntity.hasMany?.some((hasManyEntity) => hasManyEntity === entity.name)
    return otherEntityHasManyOfThisEntity
  })

  return entitiesThatHasManyOfThisEntity
}

function getBelongsToEntity({ app, entity }: { app: App; entity: AppEntity }) {
  if (!entity.belongsTo) return null

  const belongsToEntity = app.entities.find((appEntity) => appEntity.name === entity.belongsTo)

  return belongsToEntity
}

function getDynamoDbSettings({ app, entity }: { app: App; entity: AppEntity }) {
  const dynamoDbSettings: any = {}
  const isRootEntity = getIsRootEntity({ entity })

  // Don't mess with the User entity
  if (entity.name === 'User') return dynamoDbSettings

  if (isRootEntity) {
    dynamoDbSettings.partitionKey = 'userId'
    dynamoDbSettings.sortKey = getIdProperty({ entity })
  } else {
    const belongsToEntity = getBelongsToEntity({ app, entity })
    if (!belongsToEntity) {
      throw new Error(`${entity.name} belongs to ${entity.belongsTo} but there is no entity matching that name.`)
    }

    dynamoDbSettings.partitionKey = getIdProperty({
      entity: belongsToEntity,
    })
    dynamoDbSettings.sortKey = getIdProperty({ entity })
    const entitiesThatHasManyOfThisEntity = getEntitiesThatHasManyOfThisEntity({ app, entity })
    // TODO: add GSIs for entitiesThatHasManyOfThisEntity[1+]
  }

  return dynamoDbSettings
}

function getHasManySettings({ app, entity }: { app: App; entity: AppEntity }) {
  if (entity.name === 'User') return null

  const hasMany: any = {}

  for (const appEntity of app.entities) {
    if (appEntity.belongsTo === entity.name) {
      hasMany[appEntity.name] = {
        $ref: `./${paramCase(appEntity.name)}.yml`,
      }
    }
  }

  if (Object.keys(hasMany).length === 0) return null

  return hasMany
}

function getIdProperty({ entity }: { entity: AppEntity }): string {
  const idProperty = Object.entries(entity.properties).find(([, property]) => property.isIdProperty)

  return idProperty ? idProperty[0] : ''
}

function getNameProperty({ entity }: { entity: AppEntity }): string {
  const nameProperty = Object.entries(entity.properties).find(([, property]) => property.isNameProperty)

  return nameProperty ? nameProperty[0] : getIdProperty({ entity })
}

function getImageProperty({ entity }: { entity: AppEntity }): string | undefined {
  const imageProperty = Object.entries(entity.properties).find(([, property]) => property.isImageProperty || property.type === 'image')
  return imageProperty ? imageProperty[0] : undefined
}

function getPropertyType({ entityProperty }: { entityProperty: AppEntityProperty }): any {
  if (entityProperty.type === 'date-time') {
    return {
      type: 'string',
      format: 'date-time',
    }
  }

  if (entityProperty.type === 'email') {
    return {
      type: 'string',
      format: 'email',
    }
  }

  if (entityProperty.type === 'image') {
    return {
      type: 'string',
      contentEncoding: 'base64',
      contentMediaType: 'image/png',
    }
  }

  return {
    type: entityProperty.type,
  }
}

function hasUserIdProperty({ entity }: { entity: AppEntity }) {
  return Boolean(entity.properties.userId)
}

function getJsonSchemaProperties({ app, entity }: { app: App; entity: AppEntity }) {
  const jsonSchemaProperties: any = {}

  if (getIsRootEntity({ entity }) && !hasUserIdProperty({ entity })) {
    jsonSchemaProperties.userId = {
      type: 'string',
      // description: 'User',
      readOnly: true,
    }
  }

  for (const [propertyName, property] of Object.entries(entity.properties)) {
    const schemaProperties: any = {
      ...getPropertyType({ entityProperty: property }),
    }
    if (property.type === 'array') {
      // GPT often returns array instead of only adding it to hasMany
      if (property.foreignKeyEntity) {
        continue
      }

      schemaProperties.items = { type: 'string' }
    }

    if (property.title) schemaProperties.title = property.title
    // if (property.description) schemaProperties.description = property.description
    if (property.isReadOnly) schemaProperties.readOnly = property.isReadOnly
    if (property.defaultValue) schemaProperties.default = property.defaultValue
    if (property.enumOptions) schemaProperties.enum = property.enumOptions
    if (property.isLongText) {
      schemaProperties['x-codeGenie'] = {
        ui: {
          inputType: 'textarea',
        },
      }
    }

    if (property.isMoney) {
      schemaProperties['x-codeGenie'] = {
        ui: {
          format: 'money',
        },
      }
    }

    if (property.foreignKeyEntity) {
      schemaProperties['x-codeGenie'] = {
        foreignKey: {
          referencedEntity: property.foreignKeyEntity,
        },
      }
    }

    jsonSchemaProperties[getPropertyName({ propertyName, app, entity })] = schemaProperties
  }

  return jsonSchemaProperties
}

function getPropertyName({ propertyName, app, entity }: { propertyName: string; app: App; entity: AppEntity }) {
  if (propertyName.startsWith('belongsTo')) {
    const belongsToEntity = getBelongsToEntity({ app, entity })

    if (!belongsToEntity) {
      throw new Error(`Found property ${propertyName} but no belongsTo exists`)
    }

    return getIdProperty({ entity: belongsToEntity })
  }

  return propertyName
}

function getJsonSchemaRequiredProperties({ app, entity }: { app: App; entity: AppEntity }) {
  const requiredProperties = Object.entries(entity.properties).filter(([, property]) => {
    // GPT often returns array instead of only adding it to hasMany
    if (property.type === 'array' && property.foreignKeyEntity) {
      return false
    }

    return property.isRequired
  })
  const requiredPropertyNames = requiredProperties.map(([propertyName]) => getPropertyName({ propertyName, app, entity }))
  return requiredPropertyNames
}
