import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { Pgmq, genRandomName, type QueueOptionsBase, type SendBatchOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const opts: SendBatchOptions = {
    queue: rndString,
    msgs: [msg, msg],
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.sendBatch(${rndString}, msg[]) commit`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const msgIds = await mq.msg.sendBatch({ ...opts, trx })
    assert(msgIds.length === 2, 'sendBatch failed')
    assert(msgIds[0] === '1', `sendBatch failed: ${msgIds[0]}`)
    assert(msgIds[1] === '2', `sendBatch failed: ${msgIds[1]}`)

    const res = await mq.msg.read({ queue: rndString, trx })
    assert(res, 'read failed')
    assert(res.msgId === '1', 'read failed')

    const res2 = await mq.msg.read({ queue: rndString })
    assert(! res2, 'read failed, should be null')

    await trx.commit()

    const res3 = await mq.msg.read({ queue: rndString })
    assert(res3, 'read failed')
    assert(res3.msgId === '2', 'read failed')

    await sleep(1000)

    const res4 = await mq.msg.read({ queue: rndString })
    assert(res4, 'read failed, should exist')
    assert(res4.msgId === '1', 'read failed')
  })

})

