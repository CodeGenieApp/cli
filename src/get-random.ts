import { randomBytes } from 'node:crypto'

export function getRandom() {
  return randomBytes(16).toString('hex')
}
