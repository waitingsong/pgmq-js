import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { QueueDto as Dto } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('QueueDto', () => {
    it('valid', async () => {
      const { validateService } = testConfig

      const row = new Dto()
      row.queue = 'queue'
      row.isPartitioned = true
      row.isUnlogged = true
      row.createdAt = new Date().toISOString()

      validateService.validate(Dto, row)
    })

    it('invalid', async () => {
      const { validateService } = testConfig

      const msg = new Dto()
      assert(msg)

      try {
        validateService.validate(Dto, msg)
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

