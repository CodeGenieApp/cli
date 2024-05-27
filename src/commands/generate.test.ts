import { describe, expect, test } from '@jest/globals'
import { runCommand } from '@oclif/test'

describe('generate', () => {
  test('help', async () => {
    const { stdout } = await runCommand(['generate', '--help'])
    expect(stdout).toMatch(/USAGE/)
  })
})
