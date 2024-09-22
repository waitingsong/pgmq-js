import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  describe(`QueueManager`, () => {
    const rndString = genRandomName(6)
    const createOpts: OptionsBase = { queue: rndString, trx }

    it(`createUnlogged(${rndString}) uppercase name`, async () => {
      await mq.queue.createUnlogged({ queue: rndString.toUpperCase() })

      const ret = await mq.queue.getOne(createOpts)
      assert(! ret)

      const ret2 = await mq.queue.getOne({ queue: rndString.toUpperCase() })
      assert(ret2, 'should return true')
    })

  })
})

