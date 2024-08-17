import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MsgId, MsgSendDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.send}`
const data: MsgSendDto = {
  queueName: rndStr,
  msg: { foo: 'bar' },
  delay: 0,
}

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

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

