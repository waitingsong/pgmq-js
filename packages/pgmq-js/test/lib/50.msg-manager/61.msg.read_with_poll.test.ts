import assert from 'node:assert'

import { fileShortPath, genRandomString, sleep } from '@waiting/shared-core'

import { Pgmq, type ReadWithPollOptions, type SendBatchOptions, type SendOptions } from '##/index.js'
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

  it(`msg.read_with_poll(${rndString})`, async () => {
    let msgIds: string[] = []
    const now = Date.now()

    const opts: ReadWithPollOptions = {
      queue: rndString,
      vt: 0,
      qty: 2,
      maxPollSeconds: 2,
    }
    const sendOpts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend],
    }

    await Promise.all([
      mq.msg.readWithPoll(opts),
      Promise.resolve()
        .then(async () => {
          await sleep(3000)
          msgIds = await mq.msg.sendBatch(sendOpts)
        }),
    ])
    const cost = Date.now() - now
    console.info('cost:', cost)
    assert(cost > 3000, `cost: ${cost}`)
    assert(cost < 3200, `cost: ${cost}`)
  })
})

