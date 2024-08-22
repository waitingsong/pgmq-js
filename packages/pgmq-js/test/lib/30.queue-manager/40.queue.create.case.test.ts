import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName } from '##/index.js'
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
    const rndString = genRandomName(6)

    it(`createUnlogged(${rndString}) uppercase name`, async () => {
      await mq.queue.createUnlogged(rndString.toUpperCase())

      const ret = await mq.queue.getOne(rndString)
      assert(! ret)

      const ret2 = await mq.queue.getOne(rndString.toUpperCase())
      assert(ret2, 'should return true')
    })

  })
})

