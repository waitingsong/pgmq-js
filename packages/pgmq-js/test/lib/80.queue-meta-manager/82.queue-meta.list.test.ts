import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type CreateQueueMetaOptions, type Transaction, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueMetaRow } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const options: CreateQueueMetaOptions = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    options.trx = trx
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    // await mq.queueMeta.delete(options)
    await mq.destroy()
  })

  describe(`QueueMetaManager`, () => {
    it(`list()`, async () => {
      await mq.queueMeta.create(options)

      const list2 = await mq.queueMeta.list()
      assert(list2.length >= 1, `should be 1 or more, but got ${list2.length}`)
      const [meta] = list2
      assertQueueMetaRow(meta)
    })

    it(`list() limit`, async () => {
      const opts = { queue: genRandomName(6), trx }
      await mq.queueMeta.create(opts)

      const list = await mq.queueMeta.list({ trx })
      assert(list.length >= 2, `should be 2 or more, but got ${list.length}`)

      const list2 = await mq.queueMeta.list({ limit: 1 })
      assert(list2.length === 1, `should be 1 , but got ${list2.length}`)
      const [meta] = list2
      assertQueueMetaRow(meta)

      await mq.queueMeta.delete(opts)
    })

    it(`list() relativeQueueId asc`, async () => {
      const opts = { queue: genRandomName(6), trx }
      const queueId = await mq.queueMeta.create(opts)

      const list = await mq.queueMeta.list({ relativeQueueId: queueId, order: 'asc', trx })
      assert(list.length === 0)

      const id = BigInt(queueId) - 1n
      const list2 = await mq.queueMeta.list({ relativeQueueId: id, order: 'asc', limit: 1, trx })
      assert(list2.length >= 1)
      const [meta] = list2
      assert(meta?.queueId === queueId)

      await mq.queueMeta.delete(opts)
    })

    it(`list() error`, async () => {
      const trx2 = await mq.startTransaction()
      const opts = { queue: genRandomName(6), trx: trx2 }
      const queueId = await mq.queueMeta.create(opts)
      const orderBy = 'fake_order_by'

      try {
        await mq.queueMeta.list({
          relativeQueueId: queueId,
          // @ts-expect-error
          orderBy,
          trx: trx2,
        })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes(orderBy), ex.message)
        assert(trx2.isCompleted(), 'trx2 should be completed')
        return
      }
      assert(false, 'should throw error')
    })
  })

})

