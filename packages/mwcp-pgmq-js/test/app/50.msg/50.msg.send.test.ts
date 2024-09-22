import assert from 'node:assert'

import type { OptionsBase } from '@waiting/pgmq-js'
import { fileShortPath } from '@waiting/shared-core'

import type { MsgId, MsgSendDto } from '##/index.js'
import { genRandomName } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.send}`
const data: MsgSendDto = {
  queue: rndStr,
  msg: { foo: 'bar' },
  delay: 0,
}

describe(fileShortPath(import.meta.url), () => {

  const opts: OptionsBase = { queue: rndStr }
  before(async () => { await testConfig.mq.queue.createUnlogged(opts) })
  after(async () => { await testConfig.mq.queue.drop(opts) })

  describe(path, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgIds = resp.body as MsgId[]
      assert(msgIds.length === 1)
      assert(msgIds[0] === '1')
    })

  })
})

