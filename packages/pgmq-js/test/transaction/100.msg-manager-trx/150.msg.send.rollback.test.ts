import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { Pgmq, genRandomName, type SendOptions } from '##/index.js'
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

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(rndString)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.send(${rndString}, msg) rollback`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const msgIds = await mq.msg.send({ ...opts, trx })
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '1', 'send failed')

    const res = await mq.msg.read({ queue: rndString, trx })
    assert(res, 'read failed')
    assert(res.msgId === '1', 'read failed')

    const res2 = await mq.msg.read({ queue: rndString })
    assert(! res2, 'read failed, should be null')

    await trx.rollback()

    const res3 = await mq.msg.read({ queue: rndString })
    assert(! res3, 'read failed, should be null')
  })

})

