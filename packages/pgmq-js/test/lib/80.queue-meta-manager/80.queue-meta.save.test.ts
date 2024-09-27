import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteQueueMetaOptions, type OptionsBase, type CreateQueueMetaOptions, type Transaction } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let trx: Transaction
  const rndString = genRandomName(6)
  const saveOpts: CreateQueueMetaOptions = { queue: rndString }
  let ct = 0n

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    saveOpts.trx = trx
  })
  after(async () => {
    if (! trx.isCompleted()) {
      await trx.rollback()
    }
    await mq.destroy()
  })

  describe(`QueueMetaManager`, () => {
    it(`count()`, async () => {
      ct = await mq.queueMeta.count({ trx })
      assert(ct >= 0n)
      console.log({ ct })
    })

    it(`hasQueueMeta()`, async () => {
      const flag = await mq.queueMeta.hasQueueMeta(saveOpts)
      assert(! flag, 'queue should not exist')
    })

    it(`save()`, async () => {
      const queueId = await mq.queueMeta.create(saveOpts)
      assert(+queueId > 0, 'save() failed')
    })

    it(`hasQueueMeta()`, async () => {
      const flag = await mq.queueMeta.hasQueueMeta(saveOpts)
      assert(flag, 'queue should exist')
    })

    it(`delete()`, async () => {
      const delOpts: DeleteQueueMetaOptions = { queue: rndString, trx }
      await mq.queueMeta.delete(delOpts)
    })

  })
})

