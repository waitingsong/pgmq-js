import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type CreateRouteOptions, type DeleteRouteOptions, type GetRouteOptions, type RouteOptionsBase, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const opts: RouteOptionsBase = { }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`Router`, () => {
    it(`truncate()`, async () => {
      await mq.router.truncate(opts)
    })

    it(`count()`, async () => {
      const trx = await mq.startTransaction()
      await mq.router.truncate({ ...opts, trx })
      const ct = await mq.router.count({ ...opts, trx })
      assert(ct === 0n, `count() failed. ct: ${ct}`)
      await trx.rollback()
    })
  })
})

