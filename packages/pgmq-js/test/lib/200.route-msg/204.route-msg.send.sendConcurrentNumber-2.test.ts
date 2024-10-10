/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  type CreateRouteOptions,
  type MsgContent,
  type QueueId,
  type QueueOptionsBase,
  Pgmq, genRandomName,
} from '##/index.js'
import type { SendRouteMsgOptions } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q2041 = 'q2041'
  const q2042 = 'q2042'
  const q2043 = 'q2043'
  const queueNames = [q2041, q2042, q2043]
  const msg = { data: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    mq.routeMsg.sendConcurrentNumber = 2

    const queueIds: QueueId[] = []
    const createQueueOpts: QueueOptionsBase = { queue: '' }
    for (const queue of queueNames) {
      createQueueOpts.queue = queue
      const queueId = await mq.queue.create(createQueueOpts)
      queueIds.push(queueId)
    }

    const ids = [-1, ...queueIds] // -1 is invalid queueId
    const createRouteOpts: CreateRouteOptions = { routeName: rndString, queueIds }
    const id = await mq.router.create(createRouteOpts)
    assert(BigInt(id) > 0, 'create route failed')
  })
  after(async () => {
    for (const queue of queueNames) {
      await mq.queue.drop({ queue })
    }
    await mq.destroy()
  })

  describe(`RouteMsg`, () => {
    it(`send`, async () => {
      const opts: SendRouteMsgOptions = { routeName: rndString, msg }
      await mq.routeMsg.send(opts)
    })

    it(`read msg`, async () => {
      for (const queue of queueNames) {
        const readOpts: QueueOptionsBase = { queue }
        const msg3 = await mq.msg.read<typeof msg>(readOpts)
        assert(msg3, `should read msg for queue:${queue}`)
        assert.deepStrictEqual(msg3.message, msg, `read msg failed for queue:${queue}`)
      }
    })
  })
})

