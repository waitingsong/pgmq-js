import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type ReadBatchOptions, type SendBatchOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const opts: ReadBatchOptions = {
    queue: rndString,
    vt: 0,
    qty: 3,
  }

  before(async () => {
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(rndString)
    await mq.msg.sendBatch(sendOpts)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.readBatch(${rndString})`, async () => {
    const msgs = await mq.msg.readBatch(opts)
    assert(msgs.length === 2, 'msgs.length not equal 2')

    const [msg] = msgs
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')

    assert(msg.enqueuedAt instanceof Date, 'msg.enqueuedAt not exist')
    assert(msg.enqueuedAt.getTime() > 0, 'msg.enqueuedAt invalid')

    assert(msg.readCt === 1, 'msg.readCt not equal 1')

    assert(msg.vt instanceof Date, 'msg.vt not exist')
    assert(msg.vt.getTime() > 0, 'msg.vt invalid')
  })
})

