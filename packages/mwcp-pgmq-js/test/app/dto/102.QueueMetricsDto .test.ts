import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { QueueMetricsDto as Dto } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('QueueDto', () => {
    it('valid', async () => {
      const { validateService } = testConfig

      const row: Dto = new Dto()
      row.queueName = 'foo'
      row.queueLength = '1'
      row.newestMsgAgeSec = null
      row.oldestMsgAgeSec = 1
      row.scrapeTime = new Date().toISOString()
      row.totalMessages = '2'

      validateService.validate(Dto, row)
    })

    it('invalid', async () => {
      const { validateService } = testConfig

      const row = new Dto()
      row.queueName = 'foo'
      row.newestMsgAgeSec = 0

      try {
        validateService.validate(Dto, row)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.name === 'MidwayValidationError', ex.name)
        return
      }
      assert(false, 'should not reach here')
    })

  })
})

