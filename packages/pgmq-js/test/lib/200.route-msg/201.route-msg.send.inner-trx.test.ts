/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type CreateRouteOptions,
  type QueueOptionsBase,
  type QueueId,
  type MsgContent,
} from '##/index.js'
import type { SendRouteMsgOptions } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q24 = 'q24'
  const q25 = 'q25'
  const q26 = 'q26'
  const queueNames = [q24, q25, q26]
  const msg: MsgContent = { data: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)

    const queueIds: QueueId[] = []
    const createQueueOpts: QueueOptionsBase = { queue: '' }
    for (const queue of queueNames) {
      createQueueOpts.queue = queue
      const queueId = await mq.queue.create(createQueueOpts)
      queueIds.push(queueId)
    }

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
      const rows = await mq.routeMsg.send(opts)
      rows.forEach(assertSendRouteMsgResultItem)
      assert(rows.length === queueNames.length, 'send route message failed')
    })

    it(`read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue: q24 }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(msg1, `read msg failed for queue:${q24}`)
      assert.deepStrictEqual(msg1.message, msg, `read msg failed for queue:${q24}`)
    })
  })
})

