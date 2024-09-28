/* eslint-disable no-await-in-loop */
import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import {
  Pgmq, genRandomName,
  type QueueOptionsBase,
  type QueueId,
  type MsgContent,
  type SendOptions,
  type MsgId,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { assertSendRouteMsgResultItem } from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const queue = 'q231'
  const queueNames = [queue]
  const msg: MsgContent = { data: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)

    const queueIds: QueueId[] = []
    const createQueueOpts: QueueOptionsBase = { queue: '' }
    for (const queueName of queueNames) {
      createQueueOpts.queue = queueName
      const queueId = await mq.queue.create(createQueueOpts)
      queueIds.push(queueId)
    }
  })
  after(async () => {
    for (const queueName of queueNames) {
      await mq.queue.drop({ queue: queueName })
    }
    await mq.destroy()
  })

  describe(`Pgmq`, () => {
    it(`sendMsg()`, async () => {
      const opts: SendOptions = { queue, msg }
      const msgIds: MsgId[] = await mq.sendMsg(opts)
      assert(msgIds.length === 1, `sendMsg failed for queue:${queue}`)
    })

    it(`read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(msg1, `read msg failed for queue:${queue}`)
      assert.deepStrictEqual(msg1.message, msg, `read msg failed for queue:${queue}`)
    })
  })
})

