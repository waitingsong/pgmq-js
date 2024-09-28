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

  describe(`Router.createMatch()`, () => {
    it(`w/o trx`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6) }
      opts.trx = null
      const routeId = await mq.router.createMatch(opts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
    })

    it(`routeRules:'*'`, async () => {
      const routeId = await mq.router.createMatch(createOpts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId, trx }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
      console.log({ route })
    })

    it(`routeRules:[${q1}] match queue name`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6), routeRules: [q1] }
      const routeId = await mq.router.createMatch(opts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId, trx }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
      console.log({ route })
      assert(route.queueIds.length === 1, 'queueIds.length should be 1')
      const queueId = route.queueIds[0]
      assert(queueId)

      const meta = await mq.queueMeta.getById({ queueId, trx })
      assert(meta, 'should found queue meta')
      assert(meta.queue === q1, `queue name should be ${q1}, but got ${meta.queue}`)
    })

    it(`routeRules:[${q4}] match queueKey`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6), routeRules: [q4] }
      const routeId = await mq.router.createMatch(opts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId, trx }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
      console.log({ route })
      assert(route.queueIds.length === 1, 'queueIds.length should be 1')
      const queueId = route.queueIds[0]
      assert(queueId)

      const meta = await mq.queueMeta.getById({ queueId, trx })
      assert(meta, 'should found queue meta')
      assert(meta.queueKey === q4, `queue name should be ${q4}, but got ${meta.queueKey}`)
    })

    it(`routeRules:[/^q\\d/u] match queueKey and queue name`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6), routeRules: [/^q\d/u] }
      const routeId = await mq.router.createMatch(opts)
      assert(BigInt(routeId) > 0n, 'createMatch() failed')

      const getOpts: GetRouteOptions = { routeId, trx }
      const route = await mq.router.getOne(getOpts)
      assert(route, 'should found route')
      console.log({ route })
      assert(route.queueIds.length === 3, `queueIds.length should be 3, but got ${route.queueIds.length}`)
      const queueId = route.queueIds[0]
      assert(queueId)
    })

    it(`routeRules:['*'] no matched`, async () => {
      const opts: CreateRouteMatchOptions = { ...createOpts, routeName: genRandomName(6), routeRules: ['*'] }
      try {
        await mq.router.createMatch(opts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('no queue matched'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

  })
})

