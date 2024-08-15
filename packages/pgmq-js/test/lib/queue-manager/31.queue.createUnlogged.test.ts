import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
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
    const rndString = genRandomString(6)

    it(`createUnlogged(${rndString})`, async () => {
      await mq.queue.createUnlogged(rndString)
    })

    it(`getOne(${rndString})`, async () => {
      const queue = await mq.queue.getOne(rndString)
      assertQueueRow(queue)
      assert(queue?.isUnlogged, 'queue is not unlogged')
    })

    it(`drop(${rndString})`, async () => {
      const dropped = await mq.queue.drop(rndString)
      assert(dropped, 'drop failed')
    })

  })
})

