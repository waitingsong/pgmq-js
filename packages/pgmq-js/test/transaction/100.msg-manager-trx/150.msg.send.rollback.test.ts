import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type ReadOptions, type SendOptions } from '##/index.js'
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
  const createOpts: OptionsBase = { queue: rndString }
  const readOpts: ReadOptions = { queue: rndString, vt: 0 }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.send(${rndString}, msg) rollback`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const trx2 = await mq.startTransaction()

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

    await trx.rollback()

    const res3 = await mq.msg.read(readOpts)
    assert(! res3, 'read failed, should be null')

    await trx2.rollback()
  })

})

