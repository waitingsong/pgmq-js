import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName } from '##/index.js'
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
    const rndString = genRandomName(6)

    it(`create(${rndString})`, async () => {
      await mq.queue.create(rndString)
    })

    it(`hasQueue(${rndString})`, async () => {
      const flag = await mq.queue.hasQueue(rndString)
      assert(flag, 'queue not exists')
    })

    it(`getOne(${rndString})`, async () => {
      const queue = await mq.queue.getOne(rndString)
      assertQueueRow(queue)
    })

    it(`drop(${rndString})`, async () => {
      const dropped = await mq.queue.drop(rndString)
      assert(dropped, 'drop failed')
    })

    it(`drop(fake)`, async () => {
      const dropped = await mq.queue.drop(genRandomName(7))
      assert(! dropped, 'drop should failed')
    })

    it(`create(fake my-queue)`, async () => {
      const queue = 'my-queue'
      try {
        await mq.queue.create(queue)
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'should throw Error')
    })

  })
})

