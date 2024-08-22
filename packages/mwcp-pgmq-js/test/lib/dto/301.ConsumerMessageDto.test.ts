import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { ConsumerMessageDto as Dto } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('ConsumerMessageDto', () => {
    it('valid', async () => {
      const { validateService } = testConfig

      const row = new Dto()
      row.queueName = 'queue'
      row.msgId = '1'
      row.message = null
      row.enqueuedAt = new Date().toISOString()
      row.readCt = 1
      row.vt = new Date().toISOString()

      validateService.validate(Dto, row)
    })

    it('invalid', async () => {
      const { validateService } = testConfig

      const row = new Dto()
      row.queueName = 'queue'
      row.msgId = '1'
      row.message = null
      row.enqueuedAt = new Date().toISOString()
      row.readCt = -1
      row.vt = new Date().toISOString()

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

