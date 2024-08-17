import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MsgId, MsgSendBatchDto, MsgSendDto } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.sendBatch}`
const data: MsgSendBatchDto = {
  queueName: rndStr,
  msgs: [{ foo: 'bar' }, {}],
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
      assert(msgIds.length === 2, 'msgIds.length !== 2')
      console.log({ msgIds })
      assert(msgIds[0] === '1', msgIds[0])
      assert(msgIds[1] === '2', msgIds[1])
    })

  })
})

