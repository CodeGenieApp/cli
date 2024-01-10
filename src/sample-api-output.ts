export default {
  name: 'Code Genie',
  entities: [
    {
      name: 'App',
      description: '',
      properties: {
        appId: {
          type: 'string',
          description: 'Unique identifier of App',
          isReadOnly: true,
          isIdProperty: true,
          isRequired: true,
        },
        name: {
          type: 'string',
          description: 'App name',
          isNameProperty: true,
          isRequired: true,
        },
        description: {
          type: 'string',
          description: 'App description',
        },
        logo: {
          type: 'image',
          description: 'App logo',
        },
        primaryBrandColor: {
          type: 'string',
          description: 'Primary brand color',
        },
        region: {
          type: 'enum',
          description: 'AWS region',
          enumOptions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
        },
        permissionModel: {
          type: 'enum',
          description: 'Permission model',
          enumOptions: ['Global', 'User', 'Organization'],
        },
        entities: {
          type: 'array',
          description: 'List of entities',
          foreignKeyEntity: 'Entity',
        },
        builds: {
          type: 'array',
          description: 'List of builds',
          foreignKeyEntity: 'Build',
        },
      },
    },
    {
      name: 'Entity',
      description: '',
      belongsTo: 'App',
      properties: {
        entityId: {
          type: 'string',
          description: 'Unique identifier of Entity',
          isReadOnly: true,
          isIdProperty: true,
          isRequired: true,
        },
        belongsToAppId: {
          type: 'string',
          description: 'App that this Entity belongs to',
          foreignKeyEntity: 'App',
          isReadOnly: true,
          isRequired: true,
        },
        name: {
          type: 'string',
          description: 'Entity name',
          isNameProperty: true,
          isRequired: true,
        },
        idProperty: {
          type: 'string',
          description: 'Id property of Entity',
        },
        nameProperty: {
          type: 'string',
          description: 'Name property of Entity',
        },
        imageProperty: {
          type: 'string',
          description: 'Image property of Entity',
        },
        partitionKey: {
          type: 'string',
          description: 'Partition key of Entity',
        },
        sortKey: {
          type: 'string',
          description: 'Sort key of Entity',
        },
        listView: {
          type: 'enum',
          description: 'List view type',
          enumOptions: ['Card List', 'Table'],
        },
        properties: {
          type: 'array',
          description: 'List of properties',
          foreignKeyEntity: 'Property',
        },
        many: {
          type: 'array',
          description: 'List of many relationships',
          foreignKeyEntity: 'Many',
        },
      },
    },
    {
      name: 'Property',
      description: '',
      belongsTo: 'Entity',
      properties: {
        propertyId: {
          type: 'string',
          description: 'Unique identifier of Property',
          isReadOnly: true,
          isIdProperty: true,
          isRequired: true,
        },
        belongsToEntityId: {
          type: 'string',
          description: 'Entity that this Property belongs to',
          foreignKeyEntity: 'Entity',
          isReadOnly: true,
          isRequired: true,
        },
        name: {
          type: 'string',
          description: 'Property name',
        },
        description: {
          type: 'string',
          description: 'Property description',
        },
        type: {
          type: 'enum',
          description: 'Property type',
          enumOptions: ['string', 'number', 'integer', 'boolean', 'enum', 'array'],
        },
        enum: {
          type: 'array',
          description: 'Enum options',
          enumOptions: [],
        },
      },
    },
    {
      name: 'Many',
      description: '',
      belongsTo: 'Entity',
      properties: {
        manyId: {
          type: 'string',
          description: 'Unique identifier of Many',
          isReadOnly: true,
          isIdProperty: true,
          isRequired: true,
        },
        belongsToEntityId: {
          type: 'string',
          description: 'Entity that this Many belongs to',
          foreignKeyEntity: 'Entity',
          isReadOnly: true,
          isRequired: true,
        },
        foreignEntityId: {
          type: 'string',
          description: 'Foreign Entity id',
        },
      },
    },
    {
      name: 'Build',
      description: '',
      belongsTo: 'App',
      properties: {
        buildId: {
          type: 'string',
          description: 'Unique identifier of Build',
          isReadOnly: true,
          isIdProperty: true,
          isRequired: true,
        },
        belongsToAppId: {
          type: 'string',
          description: 'App that this Build belongs to',
          foreignKeyEntity: 'App',
          isReadOnly: true,
          isRequired: true,
        },
        entityId: {
          type: 'string',
          description: 'Entity id',
        },
        buildDateTime: {
          type: 'date-time',
          description: 'Build date and time',
        },
      },
    },
  ],
}
