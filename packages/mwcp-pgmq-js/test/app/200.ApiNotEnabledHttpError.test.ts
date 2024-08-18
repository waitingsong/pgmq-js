import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { ApiNotEnabledHttpError } from '##/app/error.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', () => {
      const err = new ApiNotEnabledHttpError()
      assert(err instanceof Error)
    })
  })

})

