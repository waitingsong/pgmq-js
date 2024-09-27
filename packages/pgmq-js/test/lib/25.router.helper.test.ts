import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { matchQueueKey } from '##/lib/router/router.helpers.js'


describe(fileShortPath(import.meta.url), () => {

  describe('matchQueueKey()', () => {
    it('queueKey regex', () => {
      const ret = matchQueueKey('foo', 'svc.order', [/\border\b/u])
      assert(ret, 'matchQueueKey() failed')
    })

    it('queueKey regex2', () => {
      const ret = matchQueueKey('foo', 'svc.order', [/^order\b/u])
      assert(! ret)
    })
  })

})

