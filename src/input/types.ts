export interface App {
  name: string
  description: string
  region: AwsRegion
  defaultAuthRouteEntity: keyof this['entities']
  entities: Entities
  theme: Theme
  permissionModel: PermissionModel | keyof typeof PermissionModel
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

type EntityName = Exclude<string, 'User' | 'Organization'>

export interface Entities {
  [entityName: EntityName]: Entity
}

export interface Entity {
  name?: string
  description?: string
  properties: Properties
  belongsTo?: string
  // hasMany?: string[]
  ui?: EntityUi
}

interface EntityUi {
  icon?: string
  remainOnCurrentPageOnCreate?: boolean
  generateDetailsPage?: boolean
  listView?: 'Table' | 'List' | 'CardList'
  nestedTable?: string
  showCreatedDateTime?: boolean
}

interface Properties {
  [propertyName: string]: Property
}

interface BaseProperty {
  name?: string
  description?: string
  isNameProperty?: boolean
  isImageProperty?: boolean
  isIdProperty?: boolean
  // isBelongsTo?: boolean TODO: Automatically add a property for the belongsToEntityId (i.e the idPrproperty of the belongsTo Entity)
  /** Cannot be set by the user. Use `default` to set a value during creation. */
  isReadOnly?: boolean
  /** Allowed to be set during creation, but cannot be modified later. */
  isImmutable?: boolean
  isRequired?: boolean
  ui?: PropertyUi
}

interface PropertyUi {
  showInReadView?: boolean
  showInTable?: boolean
  showInCardList?: boolean
  showInDetailsView?: boolean
}

export enum DynamicDefault {
  CurrentUserId = '$currentUserId',
}

interface StringProperty extends BaseProperty {
  type: 'string'
  default?: string | DynamicDefault.CurrentUserId
  isLongText?: boolean
  isEmail?: boolean
  format?: 'email' | 'url' | 'multiline' | 'password'
  isColor?: boolean
  minLength?: number
  maxLength?: number
  relatedEntity?: string // foreignKeyEntity
  regexPattern?: string
}

interface NumberProperty extends BaseProperty {
  type: 'number'
  default?: number
  isInteger?: boolean
  isMoney?: boolean
  isCompactNumber?: boolean
  min?: number
  max?: number
}

interface DateProperty extends BaseProperty {
  type: 'date'
  default?: '$now'
  format?: 'date' | 'date-time' | 'time' | 'timestamp'
}

interface BooleanProperty extends BaseProperty {
  type: 'boolean'
  default?: boolean
}

interface EnumProperty extends BaseProperty {
  type: 'enum'
  enumOptions: string[]
  default?: keyof this['enumOptions']
}

interface ArrayProperty extends BaseProperty {
  type: 'array'
  enumOptions: string[]
  default?: keyof this['enumOptions']
  isEnumOnly?: boolean
  // minItems?: number
  // maxItems?: number
  // uniqueItems?: boolean
}

interface ImageProperty extends BaseProperty {
  type: 'image'
}

type Property = StringProperty | NumberProperty | DateProperty | BooleanProperty | EnumProperty | ArrayProperty | ImageProperty

interface Theme {
  primaryColor: string
}

export enum PermissionModel {
  Global = 'Global',
  User = 'User',
  Organization = 'Organization',
}
