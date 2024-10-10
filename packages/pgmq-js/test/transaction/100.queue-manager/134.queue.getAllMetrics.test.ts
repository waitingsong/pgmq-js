import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, type SendOptions, type Transaction, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), function () {
  let mq: Pgmq
  let trx: Transaction
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()

    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.send(opts)
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  it(`QueueManager.getAllMetrics(${rndString})`, async () => {
    const rows = await mq.queue.getAllMetrics({ trx })
    assert(rows.length >= 1, 'getAllMetrics failed')
  })

})

