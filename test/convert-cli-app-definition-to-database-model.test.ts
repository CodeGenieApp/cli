import { expect, test } from '@oclif/test'
import { convertCliAppDefinitionToDatabaseModel } from '../src/convert-cli-app-definition-to-database-model.js'
import { AppDefinition } from '../src/input/types.js'

const appDefinition: AppDefinition = {
  appId: 'xxx',
  name: 'Name',
  description: 'Description',
  region: 'us-west-2',
  domainName: 'example.com',
  appDomainName: 'app.example.com',
  apiDomainName: 'api.example.com',
  verifyUserEmail: 'verify@example.com',
  organizationInviteEmail: 'organization-invite@example.com',
  alarmNotificationEmail: 'alarm@example.com',
  defaultAuthRouteEntityName: 'App',
  permissionModel: 'Organization',
  theme: {
    primaryColor: '#579ddd',
  },
  auth: {
    identityProviders: ['Google'],
  },
  ignoreOutputPaths: ['README.md'],
  entities: {},
}
describe('convertCliAppDefinitionToDatabaseModel', () => {
  test.it('converts CLI to DB', () => {
    const converted = convertCliAppDefinitionToDatabaseModel({ appDefinition })
    expect(JSON.stringify(converted)).to.eq(
      JSON.stringify({
        appId: 'xxx',
        name: 'Name',
        description: 'Description',
        region: 'us-west-2',
        domainName: 'example.com',
        appDomainName: 'app.example.com',
        apiDomainName: 'api.example.com',
        verifyUserEmail: 'verify@example.com',
        organizationInviteEmail: 'organization-invite@example.com',
        alarmNotificationEmail: 'alarm@example.com',
        defaultAuthRouteEntityName: 'App',
        permissionModel: 'Organization',
        themePrimaryColor: '#579ddd',
        authIdentityProviders: ['Google'],
      })
    )
  })
})
