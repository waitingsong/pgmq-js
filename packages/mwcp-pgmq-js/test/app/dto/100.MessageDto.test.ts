import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { MessageDto as Dto } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('MessageDto', () => {
    it('valid', async () => {
      const { validateService } = testConfig

      const msg = new Dto<null>()
      msg.enqueuedAt = new Date().toISOString()
      msg.message = null
      msg.msgId = '1'
      msg.readCt = 1
      msg.vt = new Date().toISOString()

      validateService.validate(Dto<null>, msg)
    })

    it('invalid', async () => {
      const { validateService } = testConfig

      const msg = new Dto<null>()
      assert(msg)

      try {
        validateService.validate(Dto<null>, msg)
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

