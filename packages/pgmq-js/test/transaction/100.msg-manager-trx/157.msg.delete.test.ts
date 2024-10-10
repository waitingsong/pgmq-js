import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type DeleteOptions, type QueueOptionsBase, type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}
const sendOpts: SendOptions = {
  queue: rndString,
  msg: msgToSend,
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

  it(`Msg.delete(${rndString}, string)`, async () => {
    const trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')

    const msgIds = await mq.msg.send({ ...sendOpts, trx })
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: msgIds[0],
    }
    const deleted = await mq.msg.delete(opts)
    assert(! deleted.length, 'delete failed')

    const deleted2 = await mq.msg.delete({ ...opts, trx })
    assert(deleted2.length === 1)

    await trx.commit()

    const deleted3 = await mq.msg.delete({ ...opts })
    assert(deleted3.length === 0)
  })

})

