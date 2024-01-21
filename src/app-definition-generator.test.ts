import util from 'node:util'
import { expect } from '@oclif/test'
import { App, getJsonSchemasFromEntities } from './app-definition-generator.js'
import codeGenieSampleOpenAiOutputJson from './sample-api-output.js'

describe('main', () => {
  it('getJsonSchemasFromEntities returns entity schemas from openai response', () => {
    const entitySchemas = getJsonSchemasFromEntities({ app: codeGenieSampleOpenAiOutputJson as unknown as App })
    console.log(util.inspect(entitySchemas, { showHidden: false, depth: null, colors: true }))
    expect(entitySchemas).equal([
      {
        entityName: 'App',
        fileName: 'app.yml',
        jsonSchema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'App',
          'x-codeGenie': {
            idProperty: 'appId',
            nameProperty: 'name',
            dynamodb: { partitionKey: 'userId', sortKey: 'appId' },
            isRootEntity: true,
            hasMany: {
              Entity: { $ref: './entity.yml' },
              Build: { $ref: './build.yml' },
            },
          },
          allOf: [{ type: 'object', $ref: '#/definitions/attributes' }],
          definitions: {
            attributes: {
              type: 'object',
              properties: {
                userId: { type: 'string', readOnly: true },
                appId: { type: 'string', readOnly: true },
                name: { type: 'string' },
                description: { type: 'string' },
                logo: {
                  type: 'string',
                  contentEncoding: 'base64',
                  contentMediaType: 'image/png',
                },
                primaryBrandColor: { type: 'string' },
                region: {
                  type: 'enum',
                  enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
                },
                permissionModel: {
                  type: 'enum',
                  enum: ['Global', 'User', 'Organization'],
                },
              },
              required: ['appId', 'name'],
              additionalProperties: false,
            },
          },
        },
      },
      {
        entityName: 'Entity',
        fileName: 'entity.yml',
        jsonSchema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Entity',
          'x-codeGenie': {
            idProperty: 'entityId',
            nameProperty: 'name',
            dynamodb: { partitionKey: 'appId', sortKey: 'entityId' },
            hasMany: {
              Property: { $ref: './property.yml' },
              Many: { $ref: './many.yml' },
            },
          },
          allOf: [{ type: 'object', $ref: '#/definitions/attributes' }],
          definitions: {
            attributes: {
              type: 'object',
              properties: {
                entityId: { type: 'string', readOnly: true },
                appId: {
                  type: 'string',
                  readOnly: true,
                  'x-codeGenie': { foreignKey: { referencedEntity: 'App' } },
                },
                name: { type: 'string' },
                idProperty: { type: 'string' },
                nameProperty: { type: 'string' },
                imageProperty: { type: 'string' },
                partitionKey: { type: 'string' },
                sortKey: { type: 'string' },
                listView: { type: 'enum', enum: ['Card List', 'Table'] },
              },
              required: ['entityId', 'appId', 'name'],
              additionalProperties: false,
            },
          },
        },
      },
      {
        entityName: 'Property',
        fileName: 'property.yml',
        jsonSchema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Property',
          'x-codeGenie': {
            idProperty: 'propertyId',
            nameProperty: 'propertyId',
            dynamodb: { partitionKey: 'entityId', sortKey: 'propertyId' },
            onCreate: 'REMAIN_ON_CURRENT_PAGE',
            buildDetailsPage: false,
          },
          allOf: [{ type: 'object', $ref: '#/definitions/attributes' }],
          definitions: {
            attributes: {
              type: 'object',
              properties: {
                propertyId: { type: 'string', readOnly: true },
                entityId: {
                  type: 'string',
                  readOnly: true,
                  'x-codeGenie': { foreignKey: { referencedEntity: 'Entity' } },
                },
                name: { type: 'string' },
                description: { type: 'string' },
                type: {
                  type: 'enum',
                  enum: ['string', 'number', 'integer', 'boolean', 'enum', 'array'],
                },
                enum: { type: 'array', items: { type: 'string' }, enum: [] },
              },
              required: ['propertyId', 'entityId'],
              additionalProperties: false,
            },
          },
        },
      },
      {
        entityName: 'Many',
        fileName: 'many.yml',
        jsonSchema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Many',
          'x-codeGenie': {
            idProperty: 'manyId',
            nameProperty: 'manyId',
            dynamodb: { partitionKey: 'entityId', sortKey: 'manyId' },
            onCreate: 'REMAIN_ON_CURRENT_PAGE',
            buildDetailsPage: false,
          },
          allOf: [{ type: 'object', $ref: '#/definitions/attributes' }],
          definitions: {
            attributes: {
              type: 'object',
              properties: {
                manyId: { type: 'string', readOnly: true },
                entityId: {
                  type: 'string',
                  readOnly: true,
                  'x-codeGenie': { foreignKey: { referencedEntity: 'Entity' } },
                },
                foreignEntityId: { type: 'string' },
              },
              required: ['manyId', 'entityId'],
              additionalProperties: false,
            },
          },
        },
      },
      {
        entityName: 'Build',
        fileName: 'build.yml',
        jsonSchema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'Build',
          'x-codeGenie': {
            idProperty: 'buildId',
            nameProperty: 'buildId',
            dynamodb: { partitionKey: 'appId', sortKey: 'buildId' },
            onCreate: 'REMAIN_ON_CURRENT_PAGE',
            buildDetailsPage: false,
          },
          allOf: [{ type: 'object', $ref: '#/definitions/attributes' }],
          definitions: {
            attributes: {
              type: 'object',
              properties: {
                buildId: { type: 'string', readOnly: true },
                appId: {
                  type: 'string',
                  readOnly: true,
                  'x-codeGenie': { foreignKey: { referencedEntity: 'App' } },
                },
                entityId: { type: 'string' },
                buildDateTime: { type: 'string', format: 'date-time' },
              },
              required: ['buildId', 'appId'],
              additionalProperties: false,
            },
          },
        },
      },
    ])
  })
})
