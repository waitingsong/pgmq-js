import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const q1 = genRandomName(6)
  const q2 = genRandomName(6)
  const q3 = genRandomName(6)
  const opts: SendOptions = {
    queue: [q1, q2],
    msg,
  }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged({ queue: q1 })
    await mq.queue.createUnlogged({ queue: q2 })
    await mq.queue.createUnlogged({ queue: q3 })
  })
  after(async () => {
    await mq.queue.drop({ queue: q1 })
    await mq.queue.drop({ queue: q2 })
    await mq.queue.drop({ queue: q3 })
    await mq.destroy()
  })

  it(`msg.send() [${q1}, ${q2}]`, async () => {
    const msgIds = await mq.msg.send(opts)
    assert(msgIds.length === 2, 'send failed')
    console.log({ msgIds })
    assert(msgIds[0] === '1', 'send failed')
    assert(msgIds[1] === '1', 'send failed')

    const msg1 = await mq.msg.read({ queue: q1 })
    assert(msg1)
    assert(msg1.msgId === '1')

    const msg2 = await mq.msg.read({ queue: q2 })
    assert(msg2)
    assert(msg2.msgId === '1')

    const msg3 = await mq.msg.read({ queue: q3 })
    assert(! msg3)
  })

})

