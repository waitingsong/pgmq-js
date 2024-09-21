import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteBatchOptions, type SendBatchOptions } from '##/index.js'
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

  it(`msg.archiveBatch(${rndString})`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const fakeMsgId = '999999999'
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
      trx,
    }
    const msgIds = await mq.msg.sendBatch(sendOpts)

    const opts: DeleteBatchOptions = {
      queue: rndString,
      msgIds: [...msgIds, fakeMsgId],
    }
    const ids = await mq.msg.archiveBatch(opts)
    assert(ids.length === 0, 'archiveBatch failed')

    const ids2 = await mq.msg.archiveBatch({ ...opts, trx })
    assert(ids2.length === 2, 'archiveBatch failed')
    assert(! ids2.includes(fakeMsgId), 'archiveBatch failed')

    await trx.commit()

    const ids3 = await mq.msg.archiveBatch(opts)
    assert(ids3.length === 0, 'archiveBatch failed')
  })
})
