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

  it(`msg.deleteBatch(${rndString})`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const fakeId = '999'
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
      trx,
    }
    const msgIds = await mq.msg.sendBatch(sendOpts)

    const opts: DeleteBatchOptions = {
      queue: rndString,
      msgIds: [...msgIds, fakeId],
    }
    const deletedMsgIds = await mq.msg.deleteBatch(opts)
    assert(deletedMsgIds.length === 0, 'deleteBatch() failed')

    const deletedMsgIds2 = await mq.msg.deleteBatch({ ...opts, trx })
    assert(deletedMsgIds2.length === 2, 'deleteBatch() failed')
    assert(deletedMsgIds2.includes(fakeId) === false, 'deleteBatch() failed')

    await trx.commit()

    const deletedMsgIds3 = await mq.msg.deleteBatch(opts)
    assert(deletedMsgIds3.length === 0, 'deleteBatch() failed')
  })

})
