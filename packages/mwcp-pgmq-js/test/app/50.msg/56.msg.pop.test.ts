import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import type { MsgPopDto } from '##/index.js'
import { genRandomName, MessageDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.pop}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgPopDto = {
  queue: rndStr,
}

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

  describe(path, () => {
    it('not exist', async () => {
      const { httpRequest, validateService } = testConfig

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msg = resp.body as MessageDto
      assert(msg)
      assert(! msg.msgId) // not found
      try {
        validateService.validate(MessageDto, msg)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.name === 'MidwayValidationError', ex.name)
        return
      }
      assert(false, 'should not reach here')
    })

    it('exist', async () => {
      const { httpRequest, mq, validateService } = testConfig

      await mq.msg.sendBatch({ queue: rndStr, msgs: [msgToSend, msgToSend] })

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const msg = resp.body as MessageDto
      assert(msg)
      assert(msg.msgId)
      validateService.validate(MessageDto, msg)
    })
  })
})

