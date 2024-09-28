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
import { RouteMsgQueueNotExistAction, type SendRouteMsgOptions } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q27 = 'q27'
  const q28 = 'q28'
  const q29 = 'q29'
  const queueNames = [q27, q28, q29]
  const queueIds: QueueId[] = ['-1'] // -1 not exist
  const msg: MsgContent = { data: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)

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
    it(`send with not exist queue`, async () => {
      const opts: SendRouteMsgOptions = { routeName: rndString, msg, onQueueNotExist: RouteMsgQueueNotExistAction.Ignore }
      const rows = await mq.routeMsg.send(opts)
      const rowsLen = rows.length
      rows.forEach(assertSendRouteMsgResultItem)
      const queueIdsLen = queueIds.length // include invalid queueId
      assert(rowsLen === queueIdsLen - 1, `send route message failed. msgIdsLen: ${rowsLen} != queueIdsLen: ${queueIdsLen} - 1`)
    })

    it(`read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue: q27 }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(msg1, `read msg failed for queue:${q27}`)
      assert.deepStrictEqual(msg1.message, msg, 'read msg failed for qu1')
    })
  })
})

