import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, type ReadBatchOptions, type SendBatchOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const headers1 = { key: 'k1' }
  const options: ReadBatchOptions = {
    queue: rndString,
    vt: 0,
    qty: 3,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
      headers: [headers1],
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.sendBatch(sendOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.readBatch(${rndString}) [headers, null]`, async () => {
    const msgs = await mq.msg.readBatch(options)
    assert(msgs.length === 2, 'msgs.length not equal 2')

    const [msg1, msg2] = msgs
    assert(msg1)
    assert(msg1.msgId === '1')
    assert.deepStrictEqual(msg1.message, msgToSend, 'msg.message not equal')
    assert.deepStrictEqual(msg1.headers, headers1, 'msg.headers not equal, msg.headers: ' + JSON.stringify(msg1.headers))

    assert(msg1.enqueuedAt instanceof Date, 'msg.enqueuedAt not exist')
    assert(msg1.enqueuedAt.getTime() > 0, 'msg.enqueuedAt invalid')

    assert(msg1.readCt === 1, 'msg.readCt not equal 1')

    assert(msg1.vt instanceof Date, 'msg.vt not exist')
    assert(msg1.vt.getTime() > 0, 'msg.vt invalid')

    assert(msg2)
    assert(msg2.msgId === '2')
    assert.deepStrictEqual(msg2.message, msgToSend, 'msg.message not equal')
    assert(msg2.headers === null, 'msg.headers not equal, msg.headers: ' + JSON.stringify(msg2.headers))
  })
})

