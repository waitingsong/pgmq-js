import assert from 'node:assert'

import type { OptionsBase } from '@waiting/pgmq-js'
import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import { QueueApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${QueueApi.base}/${QueueApi.detachArchive}`

describe(fileShortPath(import.meta.url), () => {

  const opts: OptionsBase = { queue: rndStr }
  before(async () => { await testConfig.mq.queue.createUnlogged(opts) })
  after(async () => { await testConfig.mq.queue.drop(opts) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path)
        .send(opts)
      assert(resp.ok, resp.text)

      const ret = resp.text
      assert(! ret)
    })

    it('not exist', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path)
        .send({ queue: 'FAKE' })
      assert(! resp.ok, resp.text)

      assert(resp.text.includes('not exist'), resp.text)
      assert(resp.text.includes('fake'), resp.text)
    })

  })
})

