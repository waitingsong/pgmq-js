import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


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

    it(`createUnlogged(${rndString}) duplicate got error`, async () => {
      try {
        await mq.queue.createUnlogged(rndString)
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'create duplicate should throw error')
    })

    it(`drop(${rndString})`, async () => {
      const dropped = await mq.queue.drop(rndString)
      assert(dropped, 'drop failed')
    })

  })
})

