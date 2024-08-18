import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MsgReadWithPollDto } from '##/index.js'
import { MessageDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.readWithPoll}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}

const data: MsgReadWithPollDto = {
  queueName: rndStr,
  qty: 2,
  vt: 0,
  maxPollSeconds: 1,
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
      const { httpRequest, mq, validateService } = testConfig
      await mq.msg.sendBatch(rndStr, [msgToSend, msgToSend])

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgs = resp.body as MessageDto[]
      assert(msgs)
      assert(msgs.length === 2)
      msgs.forEach((msg) => {
        validateService.validate(MessageDto, msg)
      })
    })

  })
})

