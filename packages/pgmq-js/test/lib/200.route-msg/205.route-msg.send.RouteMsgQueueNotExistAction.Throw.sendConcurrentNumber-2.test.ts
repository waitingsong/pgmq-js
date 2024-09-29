/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type CreateRouteOptions,
  type QueueOptionsBase,
  type QueueId,
  type MsgContent,
  RouteMsgQueueNotExistAction,
} from '##/index.js'
import type { SendRouteMsgOptions } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q2051 = 'q2051'
  const q2052 = 'q2052'
  const q2053 = 'q2053'
  const queueNames = [q2051, q2052, q2053]
  const msg: MsgContent = { data: rndString }

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

    const ids = ['-1', ...queueIds] // -1 is invalid queueId
    const createRouteOpts: CreateRouteOptions = { routeName: rndString, queueIds: ids }
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
      const opts: SendRouteMsgOptions = { routeName: rndString, msg, onQueueNotExist: RouteMsgQueueNotExistAction.Throw }
      try {
        await mq.routeMsg.send(opts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        return
      }
      assert(false, 'should throw error')
    })

    it(`should read no msg`, async () => {
      for (const queue of queueNames) {
        const readOpts: QueueOptionsBase = { queue }
        const msg2 = await mq.msg.read<typeof msg>(readOpts)
        assert(! msg2, `should not read msg for queue:${queue}`)
      }
    })
  })
})

