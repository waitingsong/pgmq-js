import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`Pgmq`, () => {
    it(`syncQueueMeta()`, async () => {
      const rndString = genRandomName(6)
      const createOpts: QueueOptionsBase = { queue: rndString }

      await mq.queue.create(createOpts)
      const flag = await mq.queueMeta.hasQueueMeta(createOpts)
      assert(flag, 'queue meta should exist')

      await mq.queueMeta.delete(createOpts)
      const flag2 = await mq.queueMeta.hasQueueMeta(createOpts)
      assert(! flag2, 'queue meta should not exist')

      await mq.syncQueueMeta()
      const flag3 = await mq.queueMeta.hasQueueMeta(createOpts)
      assert(flag3, 'queue meta should exist')

      await mq.queue.drop(createOpts)
    })

  })
})

