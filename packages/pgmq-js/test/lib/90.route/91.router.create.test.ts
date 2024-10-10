import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type CreateRouteOptions, type DeleteRouteOptions, type GetRouteOptions, type RouteOptionsBase, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  let routeId = 0n.toString()
  const queueIds = ['1', '2', (Math.floor(Math.random() * 100) + 1).toString()]

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`Router`, () => {
    it(`getOne(0)`, async () => {
      const getOpts: GetRouteOptions = { routeId }
      const route = await mq.router.getOne(getOpts)
      assert(! route, 'should not found route')
    })

    it(`save()`, async () => {
      const saveOpts: CreateRouteOptions = { routeName: rndString, queueIds }
      const id = await mq.router.create(saveOpts)
      assert(BigInt(id) > 0, 'create route failed')
      routeId = id

      const opts: RouteOptionsBase = { }
      const ct = await mq.router.count(opts)
      assert(ct, `count() failed. ct: ${ct}`)
      assert(BigInt(ct) > 0n, `count() failed. ct: ${ct}`)
    })

    it(`getOne(${routeId})`, async () => {
      const opts: GetRouteOptions = { routeId }
      const route = await mq.router.getOne(opts)
      assert(route, 'should found route')
      console.log({ route })
      assert.deepStrictEqual(route?.queueIds, queueIds, 'queueIds not match')
    })

    it(`delete(${routeId})`, async () => {
      const delOpts: DeleteRouteOptions = { routeId }
      await mq.router.delete(delOpts)
    })
  })
})

