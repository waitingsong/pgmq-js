import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import type { Message, OptionsBase, ReadOptions, SendOptions } from '##/index.js'
import { Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const opts: ReadOptions = {
    queue: rndString,
  }
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.send(sendOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.read(${rndString})`, async () => {
    const msg: Message | null = await mq.msg.read(opts)
    assert(msg)
    assert(msg.msgId === '1')
    assert(msg.message, 'msg.message not exist')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')

    assert(msg.enqueuedAt instanceof Date, 'msg.enqueuedAt not exist')
    assert(msg.enqueuedAt.getTime() > 0, 'msg.enqueuedAt invalid')

    assert(msg.readCt === 1, 'msg.readCt not equal 1')

    assert(msg.vt instanceof Date, 'msg.vt not exist')
    assert(msg.vt.getTime() > 0, 'msg.vt invalid')
  })
})

