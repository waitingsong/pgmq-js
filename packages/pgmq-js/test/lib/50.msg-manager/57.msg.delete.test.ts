import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type DeleteOptions, type QueueOptionsBase, type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}
const sendOpts: SendOptions = {
  queue: rndString,
  msg: msgToSend,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`Msg.delete(${rndString}, string)`, async () => {
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: msgIds[0],
    }
    const deleted = await mq.msg.delete(opts)
    assert(deleted)
    assert(deleted.length === 1)
  })

  it(`Msg.delete(${rndString}, number)`, async () => {
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: +msgIds[0],
    }
    const deleted = await mq.msg.delete(opts)
    assert(deleted)
    assert(deleted.length === 1)
    assert(deleted[0] === msgIds[0])
  })

  it(`Msg.delete(${rndString}, bigint)`, async () => {
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: BigInt(msgIds[0]),
    }
    const deleted = await mq.msg.delete(opts)
    assert(deleted)
    assert(deleted.length === 1)
    assert(deleted[0] === msgIds[0])
  })

  it(`Msg.delete(${rndString}, fake string)`, async () => {
    await mq.msg.send(sendOpts)

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: '99999', // fake
    }
    const deleted = await mq.msg.delete(opts)
    assert(deleted)
    assert(deleted.length === 0)
  })
})

