export interface AppDefinition {
  name: string
  description: string
  region: AwsRegion
  defaultAuthRouteEntity: string
  entities: Entities
  theme: Theme
  permissionModel: PermissionModel | keyof typeof PermissionModel
  appDomainName?: string
  apiDomainName?: string
  verifyUserEmail?: string
  organizationInviteEmail?: string
}

type AwsRegion =
  | 'us-east-1'
  | 'us-east-2'
  | 'us-west-1'
  | 'us-west-2'
  | 'eu-west-1'
  | 'eu-central-1'
  | 'ap-northeast-1'
  | 'ap-northeast-2'
  | 'ap-southeast-1'
  | 'ap-southeast-2'
  | 'ap-south-1'
  | 'sa-east-1'

export type EntityName = Exclude<string, 'User' | 'Organization'>

export interface Entities {
  [entityName: EntityName]: Entity
}

export interface Entity {
  description?: string
  properties: Properties
  belongsTo?: string
  ui?: EntityUi
  dynamodb?: EntityDynamoDb
}

export interface EntityDynamoDb {
  gsis?: Array<EntityGSI>
  lsis?: Array<EntityLSI>
  partitionKey?: string
  sortKey?: string
}

export interface EntityGSI {
  name: string
  partitionKey: string
  sortKey?: string
  attributes?: 'ALL'
}

export interface EntityLSI {
  name: string
  sortKey: string
  attributes: 'ALL'
}

interface EntityUi {
  icon?: string
  remainOnCurrentPageOnCreate?: boolean
  generateDetailsPage?: boolean
  listView?: 'Table' | 'List' | 'CardList'
  nestedTable?: string
  showCreatedDateTime?: boolean
}

export interface Properties {
  [propertyName: string]: Property
}

export interface BaseProperty {
  description?: string
  defaultValue?: any
  isNameProperty?: boolean
  isImageProperty?: boolean
  isIdProperty?: boolean
  // isBelongsTo?: boolean TODO: Automatically add a property for the belongsToEntityId (i.e the idPrproperty of the belongsTo Entity)
  /** Cannot be set by the user. Use `defaultValue` to set a value during creation. */
  isReadOnly?: boolean
  /** Allowed to be set during creation, but cannot be modified later. */
  isImmutable?: boolean
  isRequired?: boolean
  ui?: PropertyUi
}

export interface PropertyUi {
  showInReadView?: boolean
  showInTable?: boolean
  showInCardList?: boolean
  showInDetailsView?: boolean
}

export enum DynamicDefault {
  CurrentUserId = '$currentUserId',
}

export interface StringProperty extends BaseProperty {
  type: 'string'
  defaultValue?: string | DynamicDefault.CurrentUserId
  format?: 'email' | 'url' | 'multiline' | 'password' | 'color'
  // isLongText?: boolean TODO: replace with format: multiline
  minLength?: number
  maxLength?: number
  relatedEntity?: string // foreignKeyEntity
  regexPattern?: string
}

export interface NumberProperty extends BaseProperty {
  type: 'number'
  defaultValue?: number
  isInteger?: boolean
  isMoney?: boolean
  isCompactNumber?: boolean
  min?: number
  max?: number
}

export interface DateProperty extends BaseProperty {
  type: 'date'
  defaultValue?: '$now'
  format?: 'date' | 'date-time' | 'time' | 'timestamp'
}

interface BooleanProperty extends BaseProperty {
  type: 'boolean'
  defaultValue?: boolean
}

interface EnumProperty extends BaseProperty {
  type: 'enum'
  enumOptions: Array<string>
  defaultValue?: string
}

interface ArrayProperty extends BaseProperty {
  type: 'array'
  defaultValue?: string
  isArrayRestricted?: boolean
  arrayOptions?: Array<string>
  // minItems?: number
  // maxItems?: number
  // uniqueItems?: boolean
}

interface ImageProperty extends BaseProperty {
  type: 'image'
}

export type Property = StringProperty | NumberProperty | DateProperty | BooleanProperty | EnumProperty | ArrayProperty | ImageProperty

interface Theme {
  primaryColor: string
}

export enum PermissionModel {
  Global = 'Global',
  User = 'User',
  Organization = 'Organization',
}
