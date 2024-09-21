import assert from 'node:assert'

import { fileShortPath, genRandomString, sleep } from '@waiting/shared-core'

import { Pgmq, type ReadOptions, type SendOptions, type SetVtOptions } from '##/index.js'
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
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.setVt(${rndString})`, async () => {
    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: SetVtOptions = {
      queue: rndString,
      msgId: msgIds[0],
      vt: 1,
    }
    const msg = await mq.msg.setVt(opts)
    console.log({ msg })
    assert(msg)
    assert(msg.msgId === '1')
    assert.deepStrictEqual(msg.message, msgToSend, 'msg.message not equal')
    assert(msg.vt, 'msg.vt not exist')

    const readOpts: ReadOptions = {
      queue: rndString,
    }
    const msg2 = await mq.msg.read(readOpts)
    assert(msg2 === null, 'msg2 not null') // still invisible

    await sleep(1000)
    const msg3 = await mq.msg.read(readOpts)
    assert(msg3, 'msg3 not exist')
    assert.deepStrictEqual(msg3.message, msgToSend, 'msg.message not equal')
    assert(msg3.vt, 'msg.vt not exist')
    console.log({ msg3 })
    assert(msg3.readCt === 1, 'msg3.readCt not 1')
  })
})

