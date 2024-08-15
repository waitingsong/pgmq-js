import assert from 'node:assert'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(rndString)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`MsgManager.send(${rndString}, msg)`, async () => {
    const msg = {
      foo: 'bar',
    }
    const msgId = await mq.msg.send(rndString, msg)
    assert(BigInt(msgId) > 0n, 'send failed')
    assert(msgId === '1', 'send failed')
  })

  it(`MsgManager.send(${rndString}), msg`, async () => {
    const msg = {
      foo: 'bar',
    }
    const msgId = await mq.msg.send(rndString, msg)
    assert(BigInt(msgId) > 0n, 'send failed')
    assert(msgId === '2', 'send failed')
  })
})

