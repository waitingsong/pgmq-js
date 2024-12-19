import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type Message, type QueueOptionsBase, type SendBatchOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const options: SendBatchOptions = {
    queue: rndString,
    msgs: [msg, msg],
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

  it(`msg.sendBatch(${rndString}, msg[], delay with timestamp '1.5s')`, async () => {
    const time = await mq.getTimestamp('1.5s')
    const opts: SendBatchOptions = {
      ...options,
      delay: time.toISOString(),
    }
    const msgIds = await mq.msg.sendBatch(opts)
    assert(msgIds.length === 2, 'sendBatch failed')
    assert(msgIds[0] === '1', `sendBatch failed: ${msgIds[0]}`)
    assert(msgIds[1] === '2', `sendBatch failed: ${msgIds[1]}`)

    const msg2: Message | null = await mq.msg.read({ queue: rndString })
    assert(! msg2, 'msg2 should be null')

    await sleep(1_500)
    const msg3: Message | null = await mq.msg.read({ queue: rndString })
    assert(msg3)
    assert(msg3.msgId === '1')
    assert(msg3.message, 'msg.message not exist')
    assert.deepStrictEqual(msg3.message, msg, 'msg.message not equal')

    await mq.msg.deleteBatch({ queue: rndString, msgIds })
  })

  it(`msg.sendBatch(${rndString}, msg[], delay with int 1(s))`, async () => {
    const opts: SendBatchOptions = {
      ...options,
      delay: 1,
    }
    const msgIds = await mq.msg.sendBatch(opts)
    assert(msgIds.length === 2, 'sendBatch failed')
    assert(msgIds[0] === '3', `sendBatch failed: ${msgIds[0]}`)
    assert(msgIds[1] === '4', `sendBatch failed: ${msgIds[1]}`)

    const msg2: Message | null = await mq.msg.read({ queue: rndString })
    assert(! msg2, 'msg2 should be null')

    await sleep(1_000)
    const msg3: Message | null = await mq.msg.read({ queue: rndString })
    assert(msg3)
    assert(msg3.msgId === '3')
    assert(msg3.message, 'msg.message not exist')
    assert.deepStrictEqual(msg3.message, msg, 'msg.message not equal')

    await mq.msg.deleteBatch({ queue: rndString, msgIds })
  })

})

