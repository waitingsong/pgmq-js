import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { genRandomName } from '##/index.js'
import type { MsgArchiveDto, MsgId } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = genRandomName(6)
const path = `${MsgApi.base}/${MsgApi.archive}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgArchiveDto = {
  queue: rndStr,
  msgId: '2',
}

describe(fileShortPath(import.meta.url), () => {

  before(async () => { await testConfig.mq.queue.createUnlogged(rndStr) })
  after(async () => { await testConfig.mq.queue.drop(rndStr) })

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
      assert(ret.length === 1)
      assert(ret[0] === '2')
    })
  })
})

