import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`QueueManager`, () => {

    it(`createUnlogged(${rndString}) uppercase name`, async () => {
      await mq.queue.createUnlogged({ queue: rndString.toUpperCase() })

      const ret = await mq.queue.getOne(createOpts)
      assert(! ret)

      const ret2 = await mq.queue.getOne({ queue: rndString.toUpperCase() })
      assert(ret2, 'should return true')
    })

  })
})

