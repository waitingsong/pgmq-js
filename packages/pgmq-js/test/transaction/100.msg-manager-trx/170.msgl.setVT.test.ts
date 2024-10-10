import assert from 'node:assert'

import { fileShortPath, genRandomString, sleep } from '@waiting/shared-core'

import { type QueueOptionsBase, type ReadOptions, type SendOptions, type SetVtOptions, Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
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

  it(`msg.setVt(${rndString})`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: SetVtOptions = {
      queue: rndString,
      msgId: msgIds[0],
      vt: 1,
    }
    const msg0 = await mq.msg.setVt(opts)
    assert(! msg0)

    const msg = await mq.msg.setVt({ ...opts, trx })
    console.log({ msg })
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')
    assert(msg.vt, 'msg.vt not exist')

    await trx.rollback()
  })
})

