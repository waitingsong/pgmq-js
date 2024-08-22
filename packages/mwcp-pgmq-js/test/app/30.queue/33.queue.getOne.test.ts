import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import type { QueueDto } from '##/index.js'
import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${QueueApi.base}/${QueueApi.getOne}`

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(`${path}/${rndStr}`)
      assert(resp.ok, resp.text)

      const ret = resp.body as QueueDto
      assert(ret, 'resp.body is null')
      assert(ret.name === rndStr, `ret.name: ${ret.name} !== ${rndStr}`)
      assert(ret.isUnlogged === true, `ret.isUnlogged: ${ret.isUnlogged}`)
    })

  })
})

