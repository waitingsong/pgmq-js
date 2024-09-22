import assert from 'node:assert/strict'

import type { OptionsBase } from '@waiting/pgmq-js'
import { fileShortPath } from '@waiting/shared-core'

import type { MsgId, MsgSendBatchDto, MsgSendDto } from '##/index.js'
import { genRandomName } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.sendBatch}`
const data: MsgSendBatchDto = {
  queue: rndStr,
  msgs: [{ foo: 'bar' }, {}],
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
      assert(msgIds.length === 2, 'msgIds.length !== 2')
      console.log({ msgIds })
      assert(msgIds[0] === '1', msgIds[0])
      assert(msgIds[1] === '2', msgIds[1])
    })

  })
})

