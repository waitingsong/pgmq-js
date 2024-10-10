import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, type Transaction, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction failed')
    createOpts.trx = trx
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    await mq.destroy()
  })

  describe(`QueueManager`, () => {

    it(`createUnlogged(${rndString}) uppercase name`, async () => {
      assert(createOpts.trx, 'startTransaction failed')
      await mq.queue.createUnlogged({ ...createOpts, queue: rndString.toUpperCase() })

      const ret = await mq.queue.getOne({ ...createOpts, trx: null })
      assert(! ret, 'should return null outside transaction')

      const ret2 = await mq.queue.getOne(createOpts)
      assert(ret2)
    })

  })
})

