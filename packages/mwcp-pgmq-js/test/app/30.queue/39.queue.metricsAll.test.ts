import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import type { QueueMetricsDto } from '##/index.js'
import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${QueueApi.base}/${QueueApi.metricsAll}`

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(path)
      assert(resp.ok, resp.text)

      const ret = resp.body as QueueMetricsDto[]
      assert(ret)
      assert(ret.length > 0)
    })
  })
})

