import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')
    createOpts.trx = trx
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  describe(`QueueManager`, () => {

    it(`createUnlogged(${rndString}) uppercase name`, async () => {
      assert(createOpts.trx, 'startTransaction failed')
      await mq.queue.createUnlogged({ queue: rndString.toUpperCase() })

      const ret = await mq.queue.getOne(createOpts)
      assert(! ret)

      const ret2 = await mq.queue.getOne({ queue: rndString.toUpperCase() })
      assert(ret2, 'should return true')
    })

  })
})

