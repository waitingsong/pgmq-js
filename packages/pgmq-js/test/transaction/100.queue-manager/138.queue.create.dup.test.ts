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

    it(`create(${rndString})`, async () => {
      assert(createOpts.trx, 'startTransaction failed')
      await mq.queue.create(createOpts)
    })

    it(`create(${rndString}) duplicate got error`, async () => {
      try {
        await mq.queue.create(createOpts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'create duplicate should throw error')
    })

    it(`createUnlogged(${rndString}) duplicate no error`, async () => {
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
      const dropped = await mq.queue.drop(createOpts)
      assert(dropped, 'drop failed')
    })

  })
})

