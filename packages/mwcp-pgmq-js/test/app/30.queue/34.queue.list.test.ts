import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { QueueDto } from '##/index.js'
import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${QueueApi.base}/${QueueApi.list}`

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(path)
      assert(resp.ok, resp.text)

      const ret = resp.body as QueueDto[]
      assert(ret, 'resp.body is null')
      assert(ret.length >= 1, `ret.length: ${ret.length}`)

      const [row] = ret
      assert(row, 'row is null')
    })

  })
})

