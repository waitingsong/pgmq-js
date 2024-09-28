import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type QueueOptionsBase } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueRow } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`QueueManager`, () => {
    it(`hasQueue()`, async () => {
      const trx = await mq.startTransaction()
      const createOpts: QueueOptionsBase = { queue: genRandomName(6) }
      await mq.queue.create({ ...createOpts, trx })

      const flag = await mq.queue.hasQueue(createOpts)
      assert(! flag, 'queue should not exist')

      const flag2 = await mq.queue.hasQueue({ ...createOpts, trx })
      assert(flag2, 'queue should exist')

      if (! trx.isCompleted()) {
        await trx.rollback()
      }
    })

    it(`getOne()`, async () => {
      const trx = await mq.startTransaction()
      const createOpts: QueueOptionsBase = { queue: genRandomName(6) }
      await mq.queue.create({ ...createOpts, trx })

      const queue = await mq.queue.getOne(createOpts)
      assert(! queue, 'queue should not exist')

      const queue2 = await mq.queue.getOne({ ...createOpts, trx })
      assertQueueRow(queue2)

      if (! trx.isCompleted()) {
        await trx.rollback()
      }
    })

    it(`drop()`, async () => {
      const trx = await mq.startTransaction()
      const createOpts: QueueOptionsBase = { queue: genRandomName(6) }
      await mq.queue.create({ ...createOpts, trx })

      const dropped = await mq.queue.drop(createOpts)
      assert(! dropped, 'drop should failed')

      const dropped2 = await mq.queue.drop({ ...createOpts, trx })
      assert(dropped2, 'drop failed')

      if (! trx.isCompleted()) {
        await trx.rollback()
      }

      const dropped3 = await mq.queue.drop(createOpts)
      assert(! dropped3, 'drop should failed')
    })

  })
})

