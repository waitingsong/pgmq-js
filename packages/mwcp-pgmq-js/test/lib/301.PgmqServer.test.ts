import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { genRandomName, PgmqServer } from '##/index.js'
import { ConsumerTestService } from '#@/fixtures/base-app/src/consumer/300s.consumer.service.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const q1 = 'q1'
  const q2 = 'q2'
  const q3 = 'q3'
  const q4 = 'q4'
  const msgToSend4 = { rnd: genRandomName(6) }

  describe('PgmqServer', () => {
    it('unregisterListener()', async () => {
      const { container, mq } = testConfig

      const mqServer = container.get(PgmqServer)
      assert(mqServer, 'PgmqServer not found')

      const consumer = container.get(ConsumerTestService)
      assert(consumer, 'consumer not found')

      assert(consumer.msgs4.length === 0, 'msgs4.length !== 0')
      mqServer.unregisterListener('default', q4)

      await mq.msg.send(q4, msgToSend4)
      await sleep(2500)
      assert(consumer.msgs4.length === 0, 'msgs4.length !== 0')

    })

    it('close()', async () => {
      const { container, mq } = testConfig

      const mqServer = container.get(PgmqServer)
      assert(mqServer, 'PgmqServer not found')

      const consumer = container.get(ConsumerTestService)
      assert(consumer, 'consumer not found')

      assert(consumer.msgs4.length === 0, 'msgs4.length !== 0')
      mqServer.close()
      assert(mqServer.closed, 'mqServer.closed !== true')

      await mq.msg.send(q4, msgToSend4)
      await sleep(2500)
      assert(consumer.msgs4.length === 0, 'msgs4.length !== 0')

      await mq.queue.drop(q1)
      await mq.queue.drop(q2)
      await mq.queue.drop(q3)
      await mq.queue.drop(q4)

      const arr = mqServer.getQueryIntervals('default', q1)
      assert(arr.length === 0, 'arr.length !== 0')
    })

  })
})

