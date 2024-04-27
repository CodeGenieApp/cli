#!/usr/bin/env -S tsx
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({
  path: resolve(import.meta.dirname, '../.env.development.local'),
})

async function main() {
  const { execute } = await import('@oclif/core')
  await execute({ development: true, dir: import.meta.url })
}

await main()
