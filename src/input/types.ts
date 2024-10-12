export interface AppDefinition {
  alarmNotificationEmail?: string
  apiDomainName?: string
  appDomainName?: string
  appId?: string
  auth?: Auth
  defaultAuthRouteEntityName: string
  description: string
  domainName?: string
  emailDomainName?: string
  entities: Entities
  ignoreOutputPaths?: Array<string>
  name: string
  organizationInviteEmail?: string
  permissionModel: PermissionModel | keyof typeof PermissionModel
  region: AwsRegion
  theme: Theme
  verifyUserEmail?: string
  generators?: Generators
  defaultPermissions?: DefaultPermissions
}

export interface Generators {
  ui?: UiGenerators
  database?: DatabaseGenerators
}

type UiGenerators = 'Next.js' | 'Remix'
type DatabaseGenerators = 'DynamoDB' | 'PostgreSQL'

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
  permissions?: Permissions
  description?: string
  database?: EntityDatabase
  parentEntityName?: string
  properties: Properties
  ui?: EntityUi
  dataModelEditorPositionX?: number
  dataModelEditorPositionY?: number
}

export interface DefaultPermissions {
  create?: DefaultPermission
  list?: DefaultPermission
  get?: DefaultPermission
  update?: DefaultPermission
  delete?: DefaultPermission
}

export interface Permissions {
  create?: Permission
  list?: Permission
  get?: Permission
  update?: Permission
  delete?: Permission
}

export interface PropertyPermissions {
  read?: Permission
  write?: Permission
}

export type DefaultPermission = 'CreatedByUser' | 'Admin' | 'All' | 'Public'
export type Permission = DefaultPermission | 'Inherit'

export interface EntityDatabase {
  indexes?: Array<EntityDatabaseIndex>
  partitionKey?: string
  sortKey?: string
}

export interface EntityDatabaseIndex {
  indexType: 'GSI' | 'LSI'
  attributes?: 'ALL'
  name: string
  partitionKey?: string
  sortKey?: string
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
  showInParentDetailsPage?: boolean
  listPagePermission?: Permission
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
  permissions?: PropertyPermissions
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

export interface ArrayProperty extends BaseProperty {
  // isArrayRestricted?: boolean
  arrayItems?: Array<string>
  defaultValue?: string
  type: 'array'
  relatedEntityName?: string
  relationshipName?: string
  // minItems?: number
  // maxItems?: number
  // uniqueItems?: boolean
}

interface MapProperty extends BaseProperty {
  type: 'map'
}

interface ImageProperty extends BaseProperty {
  type: 'image'
  format?: 'camera'
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
