import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { QueueMetricsDto } from '##/index.js'
import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${QueueApi.base}/${QueueApi.metrics}`

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(`${path}/${rndStr}`)
      assert(resp.ok, resp.text)

      const ret = resp.body as QueueMetricsDto
      assert(ret)
      assert(ret.queueName === rndStr, ret.queueName)
      assert(ret.newestMsgAgeSec === null)
      assert(ret.oldestMsgAgeSec === null)
      assert(ret.queueLength === '0')
      assert(ret.scrapeTime, 'scrapeTime')
      assert(ret.totalMessages === '0')
    })

    it('not exist', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(`${path}/FAKE`)
      assert(! resp.ok, resp.text)

      assert(resp.text.includes('not exist'), resp.text)
      assert(resp.text.includes('fake'), resp.text)
    })

  })
})

