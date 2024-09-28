/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type CreateRouteMatchOptions,
  type GetRouteOptions,
  type Transaction,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  // let routeId = '0'
  let trx: Transaction
  const q1 = 'q1'
  const q4 = 'q4'
  const queueNames = [q1, 'q2', 'q3']
  const limit = 2
  const createOpts: CreateRouteMatchOptions = { routeName: rndString, routeRules: '*', limit }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    createOpts.trx = trx

    let queue = '1'
    await mq.queueMeta.create({ queue: 'fq1', queueKey: q4, trx })
    await mq.queueMeta.create({ queue: 'fq2', queueKey: 'q5', trx }) // before
    await mq.queueMeta.create({ queue: 'fq3', queueKey: 'q5', trx }) // before
    for (let i = 0; i < 100; i++) { // after
      await mq.queueMeta.create({ queue, trx })
      queue = String(Number(queue) + 1)
    }
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  describe(`Router.createMatch()`, () => {
    it(`query limit override to default 100 if param limit less then 10`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6), routeRules: [/^fq\d+/u] }
      const routeId = await mq.router.createMatch(opts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId, trx }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
      assert(route.queueIds.length === limit, `queueIds.length should be ${limit}, but got ${route.queueIds.length}`)
    })

  })
})

