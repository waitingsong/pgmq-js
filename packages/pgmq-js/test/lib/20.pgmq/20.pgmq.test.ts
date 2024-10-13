import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

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

  describe(`Pgmq`, () => {
    it(`getCurrentTime()`, async () => {
      const ret = await mq.getCurrentTime()
      assert(ret instanceof Date, 'getCurrentTime failed:')
    })

    it(`setTimeZone()`, async () => {
      const flag = await mq.setTimeZone('UTC')
      assert(flag === 'UTC', 'setTimeZone failed:' + flag)
    })

    it(`startTransaction()`, async () => {
      const trx = await mq.startTransaction()
      assert(trx)
      assert(! trx.isCompleted())
      await trx.rollback()
    })
  })
})

