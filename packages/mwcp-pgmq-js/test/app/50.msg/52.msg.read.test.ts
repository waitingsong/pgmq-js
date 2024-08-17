import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MessageDto, MsgReadDto, MsgSendDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.read}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgReadDto = {
  queueName: rndStr,
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

      const msg = resp.body as MessageDto
      assert(msg)
      assert(! msg.msgId)
    })

    it('normal', async () => {
      const { httpRequest, mq } = testConfig
      await mq.msg.sendBatch(rndStr, [msgToSend, msgToSend])

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msg = resp.body as MessageDto
      assert(msg)
      assert(msg.msgId === '1')
    })

  })
})

