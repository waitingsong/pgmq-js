import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type DeleteQueueMetaOptions, type GetQueueMetaOptions, type Transaction, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueMetaRow } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const getOneOpts: GetQueueMetaOptions = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    getOneOpts.trx = trx
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    await mq.destroy()
  })

  describe(`QueueMetaManager`, () => {
    it(`getByName()`, async () => {
      const meta = await mq.queueMeta.getByName(getOneOpts)
      assert(! meta, 'queue should not exist')

      await mq.queueMeta.create(getOneOpts)

      const m2 = await mq.queueMeta.getByName(getOneOpts)
      assertQueueMetaRow(m2)

      await mq.queueMeta.delete(getOneOpts)
    })
  })
})

