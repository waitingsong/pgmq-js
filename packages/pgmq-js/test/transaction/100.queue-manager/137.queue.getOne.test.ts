import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()

    await mq.queue.createUnlogged({ ...createOpts, trx })
    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
      trx,
    }
    await mq.msg.send(opts)
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  it(`queue.getOne(${rndString})`, async () => {
    const ret0 = await mq.queue.getOne(createOpts)
    assert(! ret0)

    const ret = await mq.queue.getOne({ ...createOpts, trx })
    assert(ret)
  })

})

