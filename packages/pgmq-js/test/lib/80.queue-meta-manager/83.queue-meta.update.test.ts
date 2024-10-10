import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  type GetQueueMetaOptions,
  type Transaction,
  Pgmq, genRandomName,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueMetaRow } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const options: GetQueueMetaOptions = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    options.trx = trx
    await mq.queueMeta.create(options)
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    // await mq.queueMeta.delete(options)
    await mq.destroy()
  })

  describe(`QueueMetaManager`, () => {
    it(`update()`, async () => {
      const meta = await mq.queueMeta.getByName(options)
      assert(meta, 'queue should exist')
      assert(! meta.mtime, 'mtime should be null')

      meta.queueKey = genRandomName(6)
      await mq.queueMeta.update({ ...meta, trx })

      const meta2 = await mq.queueMeta.getByName(options)
      assert(meta2, 'queue should exist')
      assertQueueMetaRow(meta2)
      assert(meta2.queueKey === meta.queueKey, 'update failed')
      assert(meta2.mtime, 'mtime should not be null')
    })

    it(`update() invalid`, async () => {
      const meta = await mq.queueMeta.getByName(options)
      assert(meta, 'queue should exist')

      meta.queueKey = genRandomName(10).repeat(52) // limit 512
      try {
        await mq.queueMeta.update({ ...meta, trx })
      }
      catch (ex) {
        assert(ex instanceof Error, 'should throw Error')
        return
      }
      assert(false, 'should throw Error')
    })
  })
})

