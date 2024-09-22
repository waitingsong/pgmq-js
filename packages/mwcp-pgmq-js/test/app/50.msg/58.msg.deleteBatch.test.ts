import assert from 'node:assert'

import type { OptionsBase } from '@waiting/pgmq-js'
import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import type { MsgDeleteBatchDto, MsgId } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.deleteBatch}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgDeleteBatchDto = {
  queue: rndStr,
  msgIds: ['1', '2'],
}

describe(fileShortPath(import.meta.url), () => {

  const opts: OptionsBase = { queue: rndStr }
  before(async () => { await testConfig.mq.queue.createUnlogged(opts) })
  after(async () => { await testConfig.mq.queue.drop(opts) })

  describe(path, () => {
    it('not exist', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const ret = resp.body as MsgId[]
      assert(ret)
      assert(ret.length === 0)
    })

    it('exist', async () => {
      const { httpRequest, mq } = testConfig

      await mq.msg.sendBatch({ queue: rndStr, msgs: [msgToSend, msgToSend] })

      const resp = await httpRequest.post(path).send(data)
      assert(resp.ok, resp.text)

      const ret = resp.body as MsgId[]
      assert(ret)
      assert(ret.length === 2)
      assert(ret[0] === '1')
      assert(ret[1] === '2')
    })
  })
})

