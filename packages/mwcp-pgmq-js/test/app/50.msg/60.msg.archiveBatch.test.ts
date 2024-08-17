import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import type { MsgArchiveBatchDto, MsgArchiveDto, MsgId } from '##/index.js'
import { MsgApi } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const rndStr = 'q' + genRandomString(6)
const path = `${MsgApi.base}/${MsgApi.archiveBatch}`
const msgToSend = {
  foo: 'bar',
  rnd: rndStr,
}
const data: MsgArchiveBatchDto = {
  queueName: rndStr,
  msgIds: ['1', '2', '3'],
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

      await mq.msg.sendBatch(rndStr, [msgToSend, msgToSend])

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

