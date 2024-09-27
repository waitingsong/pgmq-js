import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteOptions, type MsgId, type OptionsBase, type SendOptions, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  let msgId: MsgId
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    await mq.queue.create({ ...createOpts, trx })

    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    const res = await mq.msg.send(opts)
    assert(res[0], 'send failed')
    msgId = res[0]
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    // await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`queue.detachArchive()`, async () => {
    await mq.queue.detachArchive({ ...createOpts, trx })

    const opts: DeleteOptions = {
      queue: rndString,
      msgId,
      trx,
    }
    const ret2 = await mq.msg.archive({ ...opts, trx })
    assert(ret2.length === 1, 'archive failed')
    assert(ret2[0] === msgId, 'archive failed')

    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    const res = await mq.msg.send(sendOpts)
    assert(res[0], 'send failed')
    const opts3: DeleteOptions = {
      queue: rndString,
      msgId: res[0],
      trx,
    }
    const ret3 = await mq.msg.archive(opts3)


    const flag = await mq.queue.hasQueue(createOpts)
    assert(! flag, 'queue should not exist')

    const flag2 = await mq.queue.hasQueue({ ...createOpts, trx })
    assert(flag2, 'queue should exist')
  })

})

