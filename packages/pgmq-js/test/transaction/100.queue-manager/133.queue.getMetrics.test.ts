import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const msgToSend = {
    foo: 'bar',
    rnd: rndString,
  }
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    await mq.queue.create(createOpts)

    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    await mq.msg.send(opts)
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`queue.getMetrics() after send() w/o trx, totalMessages visible`, async () => {
    const row = await mq.queue.getMetrics(createOpts)
    assert(row, 'getMetrics failed')
    console.log(row)
    assert(row.newestMsgAgeSec === null, 'getMetrics failed')
    assert(row.oldestMsgAgeSec === null, 'getMetrics failed')
    assert(row.queueLength === '0', 'getMetrics failed')
    assert(row.queue === rndString, 'getMetrics failed')
    assert(row.scrapeTime, 'getMetrics failed')
    assert(row.totalMessages === '1', row.totalMessages) // visible out of trx!
  })

  it(`queue.getMetrics() after send() with trx`, async () => {
    const row = await mq.queue.getMetrics({ ...createOpts, trx })
    assert(row, 'getMetrics failed')
    console.log(row)
    assert(row.newestMsgAgeSec === 0, 'getMetrics failed')
    assert(row.oldestMsgAgeSec === 0, 'getMetrics failed')
    assert(row.queueLength === '1', 'getMetrics failed')
    assert(row.queue === rndString, 'getMetrics failed')
    assert(row.scrapeTime, 'getMetrics failed')
    assert(row.totalMessages === '1', 'getMetrics failed')
  })

})

