import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${QueueApi.base}/${QueueApi.createUnlogged}`

describe(fileShortPath(import.meta.url), () => {

  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path)
        .send({ name: rndStr })
      assert(resp.ok, resp.text)

      const ret = resp.text as 'ok'
      assert(ret === 'ok')
    })

  })
})

