import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type DeleteOptions, type PopOptions, type QueueOptionsBase, type SendBatchOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const opts: PopOptions = {
    queue: rndString,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.sendBatch(sendOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.pop(${rndString})`, async () => {
    const msg = await mq.msg.pop(opts)
    console.log({ msg })
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')

    const msg2 = await mq.msg.pop(opts)
    assert(msg2, 'msg2 should not be null')

    const msg3 = await mq.msg.pop(opts)
    assert(! msg3, 'msg2 should be null')
  })
})

