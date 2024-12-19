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

    it(`getTimestamp('10s')`, async () => {
      const [now, ret] = await Promise.all([
        mq.getCurrentTime(),
        mq.getTimestamp('10s'),
      ])
      const diff = ret.getTime() - now.getTime()
      console.log({ now, ret, diff })
      assert(ret instanceof Date, 'getTimestamp failed:')
      assert(diff >= 10_000 && diff < 10_010, 'getTimestamp failed:')
    })

    it(`getTimestamp()`, async () => {
      const [now, ret] = await Promise.all([
        mq.getCurrentTime(),
        mq.getTimestamp(),
      ])
      const diff = ret.getTime() - now.getTime()
      console.log({ now, ret, diff })
      assert(ret instanceof Date, 'getTimestamp failed:')
      assert(diff >= 0 && diff < 10, 'getTimestamp failed:')
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

