import assert from 'node:assert/strict'

import type { QueueOptionsBase } from '@waiting/pgmq-js'
import { fileShortPath } from '@waiting/shared-core'

import type { MsgReadWithPollDto } from '##/index.js'
import { genRandomName, MessageDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.readWithPoll}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}

const data: MsgReadWithPollDto = {
  queue: rndStr,
  qty: 2,
  vt: 0,
  maxPollSeconds: 1,
}

describe(fileShortPath(import.meta.url), () => {

  const opts: QueueOptionsBase = { queue: rndStr }
  before(async () => { await testConfig.mq.queue.createUnlogged(opts) })
  after(async () => { await testConfig.mq.queue.drop(opts) })

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
      await mq.msg.sendBatch({ queue: rndStr, msgs: [msgToSend, msgToSend] })

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

