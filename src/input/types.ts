export interface AppDefinition {
  alarmNotificationEmail?: string
  apiDomainName?: string
  appDomainName?: string
  appId?: string
  auth?: Auth
  defaultAuthRouteEntityName: string
  description: string
  domainName?: string
  entities: Entities
  ignoreOutputPaths?: Array<string>
  name: string
  organizationInviteEmail?: string
  permissionModel: PermissionModel | keyof typeof PermissionModel
  region: AwsRegion
  theme: Theme
  verifyUserEmail?: string
}

export interface Auth {
  identityProviders: Array<'SAML' | 'Google'>
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

export interface Entities {
  [entityName: string]: Entity
}

export interface Entity {
  description?: string
  dynamodb?: EntityDynamoDb
  parentEntityName?: string
  properties: Properties
  ui?: EntityUi
}

export interface EntityDynamoDb {
  gsis?: Array<EntityGSI>
  lsis?: Array<EntityLSI>
  partitionKey?: string
  sortKey?: string
}

export interface EntityGSI {
  attributes?: 'ALL'
  name: string
  partitionKey: string
  sortKey?: string
}

export interface EntityLSI {
  attributes: 'ALL'
  name: string
  sortKey: string
}

export interface EntityUi {
  generateDetailsPage?: boolean
  icon?: string
  listView?: 'Table' | 'List' | 'CardList'
  nestedTableEntityName?: string
  remainOnCurrentPageOnCreate?: boolean
  showCreatedDateTime?: boolean
  showEditInCardList?: boolean
  showEditInTable?: boolean
}

export interface Properties {
  [propertyName: string]: Property
}

export interface BaseProperty {
  defaultValue?: any
  description?: string
  isIdProperty?: boolean
  /** Allowed to be set during creation, but cannot be modified later. */
  isImmutable?: boolean
  isMainImageProperty?: boolean
  isNameProperty?: boolean
  isParentEntityIdProperty?: boolean
  /** Cannot be set by the user. Use `defaultValue` to set a value during creation. */
  isReadOnly?: boolean
  isRequired?: boolean
  ui?: PropertyUi
}

export interface PropertyUi {
  showInCardList?: boolean
  showInDetails?: boolean
  showInReadView?: boolean
  showInTable?: boolean
}

export enum DynamicDefault {
  CurrentUserId = '$currentUserId',
}

export interface StringProperty extends BaseProperty {
  defaultValue?: string | DynamicDefault.CurrentUserId
  format?: 'email' | 'url' | 'multiline' | 'password' | 'color'
  maxLength?: number
  minLength?: number
  regexPattern?: string
  relatedEntityName?: string
  relationshipName?: string
  type: 'string'
}

export interface NumberProperty extends BaseProperty {
  defaultValue?: number
  format?: 'money' | 'compact'
  isInteger?: boolean
  max?: number
  min?: number
  multipleOf?: number
  type: 'number'
}

export interface DateProperty extends BaseProperty {
  defaultValue?: '$now'
  format?: 'date' | 'date-time' | 'time' | 'timestamp'
  type: 'date'
}

interface BooleanProperty extends BaseProperty {
  defaultValue?: boolean
  type: 'boolean'
}

interface EnumProperty extends BaseProperty {
  defaultValue?: string
  enumOptions: Array<string>
  type: 'enum'
}

interface ArrayProperty extends BaseProperty {
  // isArrayRestricted?: boolean
  arrayItems?: Array<string>
  defaultValue?: string
  type: 'array'
  // minItems?: number
  // maxItems?: number
  // uniqueItems?: boolean
}

interface MapProperty extends BaseProperty {
  type: 'map'
}

interface ImageProperty extends BaseProperty {
  type: 'image'
}

export type Property =
  | StringProperty
  | NumberProperty
  | DateProperty
  | BooleanProperty
  | EnumProperty
  | ArrayProperty
  | ImageProperty
  | MapProperty

interface Theme {
  primaryColor: string
}

export enum PermissionModel {
  Global = 'Global',
  Organization = 'Organization',
  User = 'User',
}
