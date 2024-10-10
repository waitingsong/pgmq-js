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
import { type SendRouteMsgOptions, RouteMsgQueueNotExistAction } from '##/lib/route-msg/route-msg.types.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const q30 = 'q30'
  const q31 = 'q31'
  const q32 = 'q32'
  const queueNames = [q30, q31, q32]
  const queueIds: QueueId[] = ['-2'] // -2 not exist
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
      const opts: SendRouteMsgOptions = { routeName: rndString, msg, onQueueNotExist: RouteMsgQueueNotExistAction.Throw }
      try {
        await mq.routeMsg.send(opts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        const txt1 = 'Transaction query already complete'
        const txt2 = 'Queue -2 not exist while sending route message'
        assert(ex.message.includes(txt1) || ex.message.includes(txt2), ex.message)
        return
      }
      assert(false, 'send route message failed')
    })

    it(`should no read msg`, async () => {
      const readOpts: QueueOptionsBase = { queue: q30 }
      const msg1 = await mq.msg.read<typeof msg>(readOpts)
      assert(! msg1, `should not read msg for ${q30}`)

      readOpts.queue = q31
      const msg2 = await mq.msg.read<typeof msg>(readOpts)
      assert(! msg2, `should not read msg for ${q31}`)

      readOpts.queue = q32
      const msg3 = await mq.msg.read<typeof msg>(readOpts)
      assert(! msg3, `should not read msg for ${q32}`)
    })
  })
})

