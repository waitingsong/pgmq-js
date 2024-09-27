// https://mochajs.org/#global-fixtures
import assert from 'node:assert'
import { join } from 'node:path'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


export async function mochaGlobalSetup(): Promise<void> {
  void 0
}

export async function mochaGlobalTeardown(): Promise<void> {
  void 0
  const mq = new Pgmq('test', dbConfig)
  await mq.router.truncate()
}

