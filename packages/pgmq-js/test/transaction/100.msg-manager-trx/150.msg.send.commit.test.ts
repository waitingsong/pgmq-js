import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, type ReadOptions, type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const opts: SendOptions = {
    queue: rndString,
    msg,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }
  const readOpts: ReadOptions = { queue: rndString, vt: 0 }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.send(${rndString}, msg) commit`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const trx2 = await mq.startTransaction()
    assert(trx2 !== trx, 'startTransaction failed')

    const msgIds = await mq.msg.send({ ...opts, trx })
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '1', 'send failed')

    const res2 = await mq.msg.read(readOpts)
    assert(! res2, 'read failed, should be null outside trx')

    const res2a = await mq.msg.read({ ...readOpts, trx: trx2 })
    assert(! res2a, 'read failed, should be null with another trx')

    const res = await mq.msg.read<typeof msg>({ ...readOpts, trx })
    assert(res, 'read failed')
    assert(res.msgId === '1', 'read failed inside trx')
    assert(res.message.foo === msg.foo, 'read failed')

    await trx.commit()

    const res4 = await mq.msg.read(readOpts)
    assert(res4, 'read failed, should exist')
    assert(res4.msgId === '1', 'read failed')

    await trx2.rollback()
  })

})

