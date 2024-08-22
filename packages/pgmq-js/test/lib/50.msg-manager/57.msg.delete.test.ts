import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
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

  it(`Msg.delete(${rndString}, string)`, async () => {
    const msgIds = await mq.msg.send(rndString, msgToSend)
    assert(msgIds[0])
    const deleted = await mq.msg.delete(rndString, msgIds[0])
    assert(deleted)
    assert(deleted.length === 1)
  })

  it(`Msg.delete(${rndString}, number)`, async () => {
    const msgIds = await mq.msg.send(rndString, msgToSend)
    assert(msgIds[0])
    const deleted = await mq.msg.delete(rndString, +msgIds[0])
    assert(deleted)
    assert(deleted.length === 1)
    assert(deleted[0] === msgIds[0])
  })

  it(`Msg.delete(${rndString}, bigint)`, async () => {
    const msgIds = await mq.msg.send(rndString, msgToSend)
    assert(msgIds[0])
    const deleted = await mq.msg.delete(rndString, BigInt(msgIds[0]))
    assert(deleted)
    assert(deleted.length === 1)
    assert(deleted[0] === msgIds[0])
  })

  it(`Msg.delete(${rndString}, fake string)`, async () => {
    await mq.msg.send(rndString, msgToSend)
    const deleted = await mq.msg.delete(rndString, '99999')
    assert(deleted)
    assert(deleted.length === 0)
  })
})

