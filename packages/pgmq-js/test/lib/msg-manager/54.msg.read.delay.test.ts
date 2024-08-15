import assert from 'node:assert'

import { fileShortPath, genRandomString, sleep } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(rndString)
    await mq.msg.send(rndString, msgToSend)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`MsgManager.read(${rndString}, delay)`, async () => {
    const msg = await mq.msg.read(rndString, 1)
    assert(msg)
    assert(msg.msgId === '1')

    const msg2 = await mq.msg.read(rndString)
    assert(msg2 === null, 'msg2 not null') // still invisible

    await sleep(1000)
    const msg3 = await mq.msg.read(rndString, 3)
    assert(msg3, 'msg3 not exist')

    await sleep(1000)
    const msg4 = await mq.msg.read(rndString)
    assert(msg4 === null, 'msg4 not null') // still invisible

    await sleep(2000)
    const msg5 = await mq.msg.read(rndString)
    assert(msg5, 'msg5 not exist') // visible

    const msg6 = await mq.msg.read(rndString)
    assert(msg6, 'msg6 not exist') // visible
  })
})

