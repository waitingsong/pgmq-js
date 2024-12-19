import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type Message, type QueueOptionsBase, type SendOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const options: SendOptions = {
    queue: rndString,
    msg,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.send(${rndString}, delay with timestamp '1.5s')`, async () => {
    const time = await mq.getTimestamp('1.5s')
    const opts: SendOptions = {
      ...options,
      delay: time.toISOString(),
    }
    const msgIds = await mq.msg.send(opts)
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '1', 'send failed')

    const msg2: Message | null = await mq.msg.read({ queue: rndString })
    assert(! msg2, 'msg2 should be null')

    await sleep(1_500)
    const msg3: Message | null = await mq.msg.read({ queue: rndString })
    assert(msg3)
    assert(msg3.msgId === '1')
    assert(msg3.message, 'msg.message not exist')
    assert.deepStrictEqual(msg3.message, msg, 'msg.message not equal')

    await mq.msg.delete({ queue: rndString, msgId: '1' })
  })

  it(`msg.send(${rndString}, delay with int 1(s))`, async () => {
    const time = await mq.getTimestamp('1s')
    const opts: SendOptions = {
      ...options,
      delay: 1,
    }
    const msgIds = await mq.msg.send(opts)
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '2', 'send failed:' + msgIds.toString())

    const msg2: Message | null = await mq.msg.read({ queue: rndString })
    assert(! msg2, 'msg2 should be null')

    await sleep(1_000)
    const msg3: Message | null = await mq.msg.read({ queue: rndString })
    assert(msg3)
    assert(msg3.msgId === '2')
    assert(msg3.message, 'msg.message not exist')
    assert.deepStrictEqual(msg3.message, msg, 'msg.message not equal')

    await mq.msg.delete({ queue: rndString, msgId: '2' })
  })

})

