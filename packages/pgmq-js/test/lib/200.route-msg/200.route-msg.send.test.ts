/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  type CreateRouteOptions,
  type DeleteRouteOptions,
  type MsgContent,
  type QueueId,
  type QueueOptionsBase,
  type Transaction,
  Pgmq, genRandomName,
} from '##/index.js'
import type { SendRouteMsgOptions } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  let trx: Transaction
  const qu1 = 'qu1'
  const qu2 = 'qu2'
  const qu3 = 'qu3'
  const queueNames = [qu1, qu2, qu3]
  const msg: MsgContent = { data: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    trx = await mq.startTransaction()
    assert(trx)

    const queueIds: QueueId[] = []
    const createQueueOpts: QueueOptionsBase = { queue: '', trx }
    for (const queue of queueNames) {
      createQueueOpts.queue = queue
      const queueId = await mq.queue.create(createQueueOpts)
      queueIds.push(queueId)
    }

    const createRouteOpts: CreateRouteOptions = { routeName: rndString, queueIds, trx }
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
      const opts: SendRouteMsgOptions = { routeName: rndString, msg, trx }
      try {
        const rows = await mq.routeMsg.send(opts)
        assert(rows.length === queueNames.length, 'send route message failed')
        rows.forEach(assertSendRouteMsgResultItem)
        await trx.commit()
      }
      catch (ex) {
        await trx.rollback()
        throw ex
      }
    })

    it(`read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue: qu1 }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(msg1, `read msg failed for queue:${qu1}`)
      assert.deepStrictEqual(msg1.message, msg, 'read msg failed for qu1')
    })
  })
})

