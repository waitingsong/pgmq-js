/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type CreateRouteMatchOptions,
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
  const createOpts: CreateRouteMatchOptions = { routeName: rndString, routeRules: '*', limit: 3 }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx, 'startTransaction() failed')
    createOpts.trx = trx

    await mq.queueMeta.create({ queue: 'fq1', queueKey: q4, trx })
    await mq.queueMeta.create({ queue: 'fq2', queueKey: 'q5', trx })
    for (const name of queueNames) {
      await mq.queueMeta.create({ queue: name, trx })
    }
  })
  after(async () => {
    await trx.rollback()
    await mq.destroy()
  })

  describe(`Router.list()`, () => {
    it(`routeRules:'*'`, async () => {
      const routeId = await mq.router.createMatch(createOpts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const route = await mq.router.list({ trx })
      assert(route, 'should found route')
      console.log({ route })
    })

  })
})

