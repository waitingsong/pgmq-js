// https://mochajs.org/#global-fixtures
import assert from 'node:assert'
import { join } from 'node:path'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


export async function mochaGlobalSetup(): Promise<void> {
  void 0
  const mq = new Pgmq('test', dbConfig)
  const queueCt = await mq.queueMeta.count()
  if (queueCt > 0) {
    throw new Error('tb_queue_meta not empty, maybe connecting to PRODUCTION database!!!')
  }
}

export async function mochaGlobalTeardown(): Promise<void> {
  void 0
  const mq = new Pgmq('test', dbConfig)
  await mq.router.truncate()
  await mq.queueMeta.truncate()
}

