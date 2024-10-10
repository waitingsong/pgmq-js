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
      await trx.commit()
    }
    await mq.destroy()
  })

  describe(`QueueManager`, () => {

    it(`create(${rndString})`, async () => {
      assert(createOpts.trx, 'startTransaction failed')
      await mq.queue.create(createOpts)
      await trx.commit()
    })

    it(`create(${rndString}) duplicate got error`, async () => {
      try {
        await mq.queue.create(createOpts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(trx.isCompleted(), 'trx is already completed')
        return
      }
      assert(false, 'create duplicate should throw error')
    })

    it(`createUnlogged(${rndString}) duplicate no error`, async () => {
      if (trx.isCompleted()) {
        trx = await mq.startTransaction()
        createOpts.trx = trx
      }

      try {
        await mq.queue.createUnlogged(createOpts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'create duplicate should throw error')
    })

    it(`drop(${rndString})`, async () => {
      if (trx.isCompleted()) {
        trx = await mq.startTransaction()
        createOpts.trx = trx
      }
      const dropped = await mq.queue.drop(createOpts)
      assert(dropped, 'drop failed')
    })

    it(`getById(${rndString})`, async () => {
      if (trx.isCompleted()) {
        trx = await mq.startTransaction()
        createOpts.trx = trx
      }
      const qu = await mq.queue.getOne(createOpts)
      assert(! qu, 'should not found queue')
    })

  })
})

