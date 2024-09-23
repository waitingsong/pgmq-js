import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { PgmqManager, PgmqServer } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('PgmqServer', () => {
    it('normal', () => {
      const { container } = testConfig

      const mqServer = container.get(PgmqServer)
      assert(mqServer, 'mqManager not found')
      assert(mqServer.closed === false, 'closed !== false')
    })

    it('initQueue() autoCreateQueue:false', async () => {
      const { container } = testConfig

      const sourceName = 'default'
      const mqManager = container.get(PgmqManager)
      const mq = mqManager.getDataSource(sourceName)
      assert(mq, `sourceName not found: ${sourceName}`)

      const mqServer = container.get(PgmqServer)
      assert(mqServer, 'mqManager not found')

      const queue = 'fake-queue-' + Date.now()

      try {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await mqServer.initQueue('default', mq, queue, false)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.startsWith('queue not found'), ex.message)
        assert(ex.message.includes(queue), ex.message)
        return
      }

      assert(false, 'should not reach here')
    })

    it('initQueue() autoCreateQueue:true', async () => {
      const { container } = testConfig

      const sourceName = 'default'
      const mqManager = container.get(PgmqManager)
      const mq = mqManager.getDataSource(sourceName)
      assert(mq, `sourceName not found: ${sourceName}`)

      const mqServer = container.get(PgmqServer)
      assert(mqServer, 'mqManager not found')

      const queue = 'queue-' + Date.now()

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await mqServer.initQueue('default', mq, queue, true)

      const queueExists = await mq.queue.hasQueue({ queue })
      assert(queueExists, 'queue not exists')

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await mqServer.initQueue('default', mq, queue, true)
      const queueExists2 = await mq.queue.hasQueue({ queue })
      assert(queueExists2, 'queue not exists')

      try {
        await mq.queue.drop({ queue })
      }
      catch (ex) {
        return
      }
    })
  })

})

