import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { PgmqManager } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('PgmqManager', () => {
    it('normal', () => {
      const { container } = testConfig

      const mqManager = container.get(PgmqManager)
      assert(mqManager, 'mqManager not found')
      assert(mqManager.getName() === 'PgmqManager', 'getName() !== PgmqManager')
    })
  })

})

