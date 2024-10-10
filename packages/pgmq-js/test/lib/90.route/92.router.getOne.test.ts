import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  type CreateRouteOptions,
  type DeleteRouteOptions,
  type GetRouteOptions,
  type RouteDto, type RouteOptionsBase,
  Pgmq, genRandomName,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  let routeId = 0n.toString()
  const queueIds = ['1', '2', (Math.floor(Math.random() * 100) + 1).toString()]
  let route: RouteDto | null

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`Router`, () => {
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

    it(`getOne(${routeId}) by routeId`, async () => {
      const opts: GetRouteOptions = { routeId }
      route = await mq.router.getOne(opts)
      assert(route, 'should found route')
      assert.deepStrictEqual(route?.queueIds, queueIds, 'queueIds not match')
    })

    it(`getOne(${rndString}) by routeName`, async () => {
      assert(route, 'should found route with previous getOne()')
      const opts: GetRouteOptions = { routeName: route.routeName }
      const route2 = await mq.router.getOne(opts)
      assert(route2, 'should found route')
      assert.deepStrictEqual(route2?.queueIds, queueIds, 'queueIds not match')
      assert.deepStrictEqual(route2, route, 'route not match')
    })

    it(`getOne() either routeId or routeName empty`, async () => {
      const opts: GetRouteOptions = { }
      try {
        await mq.router.getOne(opts)
      }
      catch (ex) {
        assert(ex instanceof Error, 'should throw Error')
        return
      }
      assert(false, 'should throw Error')
    })

    it(`delete(${routeId})`, async () => {
      const delOpts: DeleteRouteOptions = { routeId }
      await mq.router.delete(delOpts)
    })
  })
})

