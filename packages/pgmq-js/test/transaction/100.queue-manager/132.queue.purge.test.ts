import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { testConfig } from '#@/root.config.js'


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
    await mq.queue.create({ ...createOpts, trx })
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

  it(`queue.purge(${rndString})`, async () => {
    try {
      await mq.queue.purge(createOpts)
    }
    catch (ex) {
      assert(ex instanceof Error, 'expect Error')
      const numString = await mq.queue.purge({ ...createOpts, trx })
      assert(numString === '1', 'purge failed, expect "1" but got: ' + numString)
      return
    }
    assert(false, 'expect throw Error but not')
  })

})

