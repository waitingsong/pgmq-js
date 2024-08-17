import assert from 'node:assert'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(rndString)
    await mq.msg.sendBatch(rndString, [msgToSend, msgToSend])
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.pop(${rndString})`, async () => {
    const msg = await mq.msg.pop(rndString)
    console.log({ msg })
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')

    const msg2 = await mq.msg.pop(rndString)
    assert(msg2, 'msg2 should not be null')

    const msg3 = await mq.msg.pop(rndString)
    assert(! msg3, 'msg2 should be null')
  })
})

