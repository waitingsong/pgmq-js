import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteOptions, type QueueOptionsBase, type SendOptions } from '##/index.js'
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

  it(`msg.archive(${rndString})`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: msgIds[0],
    }
    const ret = await mq.msg.archive(opts)
    assert(ret.length === 0, 'archive failed')

    const ret2 = await mq.msg.archive({ ...opts, trx })
    assert(ret2.length === 1, 'archive failed')
    assert(ret2[0] === msgIds[0], 'archive failed')

    await trx.commit()

    const ret3 = await mq.msg.archive(opts)
    assert(ret3.length === 0, 'archive failed')
  })
})

