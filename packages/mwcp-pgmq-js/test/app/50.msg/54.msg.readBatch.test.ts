import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MessageDto, MsgReadBatchDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.readBatch}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgReadBatchDto = {
  queueName: rndStr,
  qty: 2,
  vt: 0,
}

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('empty', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgs = resp.body as MessageDto[]
      assert(msgs)
      assert(msgs.length === 0)
    })

    it('normal', async () => {
      const { httpRequest, mq } = testConfig
      await mq.msg.sendBatch(rndStr, [msgToSend, msgToSend])

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgs = resp.body as MessageDto[]
      assert(msgs)
      assert(msgs.length === 2)
    })

  })
})

