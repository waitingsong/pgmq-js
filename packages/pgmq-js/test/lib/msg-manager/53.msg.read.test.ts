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
    await mq.msg.send(rndString, msgToSend)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`MsgManager.read(${rndString})`, async () => {
    const msg = await mq.msg.read(rndString)
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')
    assert(msg.enqueuedAt, 'msg.enqueuedAt not exist')
    assert(new Date(msg.enqueuedAt).getTime() > 0, 'msg.enqueuedAt invalid')
    assert(msg.readCt === 1, 'msg.readCt not equal 1')
    assert(msg.vt, 'msg.vt not exist')
    assert(new Date(msg.vt).getTime() > 0, 'msg.vt invalid')
  })
})

