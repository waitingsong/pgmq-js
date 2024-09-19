import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import type { MsgDeleteDto, MsgId, MsgSendDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.delete}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgDeleteDto = {
  queue: rndStr,
  msgId: '1',
}

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('not exist', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgIds = resp.body as MsgId[]
      assert(msgIds)
      assert(msgIds.length === 0)
    })

    it('exist', async () => {
      const { httpRequest, mq } = testConfig

      await mq.msg.sendBatch({ queue: rndStr, msgs: [msgToSend, msgToSend] })

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msgIds = resp.body as MsgId[]
      assert(msgIds)
      assert(msgIds.length === 1)
      assert(msgIds[0] === '1')
    })
  })
})

