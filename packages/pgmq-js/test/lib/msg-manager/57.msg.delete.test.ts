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
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`MsgManager.delete(${rndString}, string)`, async () => {
    const msgId = await mq.msg.send(rndString, msgToSend)
    const deleted = await mq.msg.delete(rndString, msgId)
    assert(deleted === true, 'delete failed')
  })

  it(`MsgManager.delete(${rndString}, number)`, async () => {
    const msgId = await mq.msg.send(rndString, msgToSend)
    const deleted = await mq.msg.delete(rndString, +msgId)
    assert(deleted === true, 'delete failed')
  })

  it(`MsgManager.delete(${rndString}, bigint)`, async () => {
    const msgId = await mq.msg.send(rndString, msgToSend)
    const deleted = await mq.msg.delete(rndString, BigInt(msgId))
    assert(deleted === true, 'delete failed')
  })
})

