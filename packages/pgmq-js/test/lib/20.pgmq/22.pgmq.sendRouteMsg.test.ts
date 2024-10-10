/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  type CreateRouteOptions,
  type MsgContent,
  type QueueId,
  type QueueOptionsBase,
  type SendRouteMsgOptions,
  type SendRouteMsgResultItem,
  Pgmq,
  genRandomName,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q221 = 'q221'
  const q222 = 'q222'
  const q223 = 'q223'
  const queueNames = [q221, q222, q223]
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

  describe(`Pgmq`, () => {
    it(`sendRouteMsg()`, async () => {
      const opts: SendRouteMsgOptions = { routeName: rndString, msg }
      const rows: SendRouteMsgResultItem[] = await mq.sendRouteMsg(opts)
      rows.forEach(assertSendRouteMsgResultItem)
      assert(rows.length === queueNames.length, 'send route message failed')
    })

    it(`read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue: q221 }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(msg1, `read msg failed for queue:${q221}`)
      assert.deepStrictEqual(msg1.message, msg, `read msg failed for queue:${q221}`)
    })
  })
})

