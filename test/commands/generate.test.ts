import { expect, test } from '@oclif/test'

describe('generate', () => {
  test
    .stdout()
    .command(['generate', '--description=A todo app'])
    .it('outputs the app description and defaults to deploy=false', (ctx) => {
      console.log(ctx.stdout)
      expect(ctx.stdout).to.contain('Your app description is: A todo app. Deploy: false; Profile: default')
    })

  test
    .stdout()
    .command(['generate', '--description=A todo app', '-d'])
    .it('outputs the app description and deploys', (ctx) => {
      expect(ctx.stdout).to.contain('Your app description is: A todo app. Deploy: true; Profile: default')
    })

  test
    .stdout()
    .command(['generate', '--description=A todo app', '--json'])
    .it('returns json', (ctx) => {
      expect(ctx.stdout).to.contain(
        JSON.stringify(
          {
            description: 'A todo app',
            deploy: false,
            deployProfile: 'default',
          },
          null,
          2,
        ),
      )
    })
})
