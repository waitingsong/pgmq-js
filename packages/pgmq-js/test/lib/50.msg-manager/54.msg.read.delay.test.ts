import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type QueueOptionsBase, type ReadOptions, type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const opts: ReadOptions = {
    queue: rndString,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.send(sendOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.read(${rndString}, delay)`, async () => {
    const msg = await mq.msg.read({ ...opts, vt: 1 })
    assert(msg)
    assert(msg.msgId === '1')

    const msg2 = await mq.msg.read(opts)
    assert(msg2 === null, 'msg2 not null') // still invisible

    await sleep(1000)
    const msg3 = await mq.msg.read({ ...opts, vt: 3 }) // vt updated
    assert(msg3, 'msg3 not exist')

    await sleep(1000)
    const msg4 = await mq.msg.read(opts)
    assert(msg4 === null, 'msg4 not null') // still invisible

    await sleep(2000)
    const msg5 = await mq.msg.read(opts) // default vt is 1
    assert(msg5, 'msg5 not exist') // visible

    const msg6 = await mq.msg.read(opts)
    assert(! msg6, 'msg6 not null') // invisible

    await sleep(1000)
    const msg7 = await mq.msg.read(opts)
    assert(msg7, 'msg7 not exist') // invisible
  })
})

