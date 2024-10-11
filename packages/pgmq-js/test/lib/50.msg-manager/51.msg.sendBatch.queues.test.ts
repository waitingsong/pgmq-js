import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type SendBatchOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const q1 = genRandomName(6)
  const q2 = genRandomName(6)
  const opts: SendBatchOptions = {
    queue: [q1, q2],
    msgs: [msg, msg],
  }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged({ queue: q1 })
    await mq.queue.createUnlogged({ queue: q2 })
  })
  after(async () => {
    await mq.queue.drop({ queue: q1 })
    await mq.queue.drop({ queue: q2 })
    await mq.destroy()
  })

  it(`msg.sendBatch() [${q1}, ${q2}]`, async () => {
    const msgIds = await mq.msg.sendBatch(opts)
    assert(msgIds.length === 4, 'sendBatch failed')
    console.log({ msgIds })
    assert(msgIds[0] === '1', `sendBatch failed: ${msgIds[0]}`)
    assert(msgIds[1] === '2', `sendBatch failed: ${msgIds[1]}`)
    assert(msgIds[2] === '1', `sendBatch failed: ${msgIds[2]}`)
    assert(msgIds[3] === '2', `sendBatch failed: ${msgIds[3]}`)
  })

})

