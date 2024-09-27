import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueRow } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    // await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  describe(`QueueManager`, () => {

    it(`create(${rndString})`, async () => {
      await mq.queue.create(createOpts)
    })

    it(`hasQueue(${rndString})`, async () => {
      const flag = await mq.queue.hasQueue(createOpts)
      assert(flag, 'queue not exists')
    })

    it(`QueueMetaManager.hasQueueMeta(${rndString})`, async () => {
      const flag = await mq.queueMeta.hasQueueMeta(createOpts)
      assert(flag, 'queue not exists')
    })

    it(`getOne(${rndString})`, async () => {
      const queue = await mq.queue.getOne(createOpts)
      assertQueueRow(queue)
    })

    it(`drop(${rndString})`, async () => {
      const dropped = await mq.queue.drop(createOpts)
      assert(dropped, 'drop failed')
    })

    it(`drop(fake)`, async () => {
      const dropped = await mq.queue.drop({ queue: genRandomName(7) })
      assert(! dropped, 'drop should failed')
    })

    it(`create(my-queue) valid`, async () => {
      const queue = 'my-queue-' + genRandomName(7)
      await mq.queue.create({ queue })
    })

    it(`create(fake my--queue) invalid -`, async () => {
      const queue = 'my--queue-' + genRandomName(7)
      try {
        await mq.queue.create({ queue })
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'should throw Error')
    })
  })
})

