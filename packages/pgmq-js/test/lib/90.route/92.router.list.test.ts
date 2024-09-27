import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type GetAllRouteOptions,
  type SaveRouteOptions,
} from '##/index.js'
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
    it(`getAll()`, async () => {
      const saveOpts: SaveRouteOptions = { routeName: rndString, queueIds }
      const id = await mq.router.create(saveOpts)
      assert(BigInt(id) > 0, 'create route failed')
      routeId = id
      console.log({ routeId })

      const opts: GetAllRouteOptions = { }
      const routes = await mq.router.getAll(opts)
      console.log({ routes })
      assert(routes.length > 0, 'getAll() failed')

      const routeIdExists = routes.some(route => route.routeId === routeId)
      assert(routeIdExists, 'getAll() failed')
    })

    it(`getAll() duplicate routeName`, async () => {
      const saveOpts: SaveRouteOptions = { routeName: rndString, queueIds }
      try {
        await mq.router.create(saveOpts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('duplicate key value violates unique constraint'), 'create route failed')
        return
      }
      assert(false, 'create route failed')
    })

    it(`getAll() trx`, async () => {
      const trx = await mq.startTransaction()
      assert(trx)

      const saveOpts: SaveRouteOptions = { routeName: genRandomName(6), queueIds, trx }
      const id = await mq.router.create(saveOpts)
      assert(BigInt(id) > 0, 'create route failed')
      routeId = id
      console.log({ routeId })

      const opts: GetAllRouteOptions = { }

      const routes0 = await mq.router.getAll(opts)
      assert(routes0.length > 0)
      const routeIdExists0 = routes0.some(route => route.routeId === routeId)
      assert(! routeIdExists0)

      const routes = await mq.router.getAll({ ...opts, trx })
      assert(routes.length > 0)
      const routeIdExists = routes.some(route => route.routeId === routeId)
      assert(routeIdExists)

      await trx.commit()

      const routes3 = await mq.router.getAll(opts)
      assert(routes3.length > 0, 'getAll() failed')
      const routeIdExists3 = routes.some(route => route.routeId === routeId)
      assert(routeIdExists3)
    })

    it(`getAll() trx error`, async () => {
      const trx = await mq.startTransaction()
      assert(trx)

      const opts: GetAllRouteOptions = {
        // @ts-expect-error
        orderBy: 'fake',
        trx,
      }
      try {
        await mq.router.getAll(opts)
      }
      catch (ex) {
        if (! trx.isCompleted()) {
          await trx.rollback()
        }
        assert(ex instanceof Error)
        assert(ex.message.includes('fake'), ex.message)
        assert(ex.message.includes('does not exist'), ex.message)
        return
      }
      assert(false, 'create route failed')
    })
  })
})

