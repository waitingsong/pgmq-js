import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertQueueRow } from '#@/test.helper.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    // await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  describe(`QueueManager`, () => {
    it(`createUnlogged(${rndString})`, async () => {
      await mq.queue.createUnlogged(createOpts)
    })

    it(`getOne(${rndString})`, async () => {
      const queue = await mq.queue.getOne(createOpts)
      assertQueueRow(queue)
      assert(queue?.isUnlogged, 'queue is not unlogged')
    })

    it(`drop(${rndString})`, async () => {
      const dropped = await mq.queue.drop(createOpts)
      assert(dropped, 'drop failed')
    })

  })
})

