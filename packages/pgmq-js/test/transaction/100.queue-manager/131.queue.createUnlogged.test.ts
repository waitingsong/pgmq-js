import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueRow } from '#@/test.helper.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    await mq.destroy()
  })

  describe(`QueueManager.createUnlogged`, () => {
    it(`createUnlogged(${rndString})`, async () => {
      await mq.queue.createUnlogged({ ...createOpts, trx })
    })

    it(`getOne(${rndString})`, async () => {
      const queue0 = await mq.queue.getOne(createOpts)
      assert(! queue0, 'queue should not exist out of transaction')

      const queue = await mq.queue.getOne({ ...createOpts, trx })
      assertQueueRow(queue)
      assert(queue?.isUnlogged, 'queue is not unlogged')
    })

    it(`drop(${rndString})`, async () => {
      const dropped0 = await mq.queue.drop(createOpts)
      assert(! dropped0, 'drop should not exist out of transaction')

      const dropped = await mq.queue.drop({ ...createOpts, trx })
      assert(dropped, 'drop failed')
    })

  })
})

