import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteBatchOptions, type QueueOptionsBase, type SendBatchOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
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

  it(`msg.archiveBatch(${rndString})`, async () => {
    const fakeMsgId = '999999999'
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
    }
    const msgIds = await mq.msg.sendBatch(sendOpts)

    const opts: DeleteBatchOptions = {
      queue: rndString,
      msgIds: [...msgIds, fakeMsgId],
    }
    const ids = await mq.msg.archiveBatch(opts)
    assert(ids.length === 2, 'archiveBatch failed')
    assert(! ids.includes(fakeMsgId), 'archiveBatch failed')
  })
})

