import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type QueueOptionsBase, type SendOptions, Pgmq, genRandomName } from '##/index.js'
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
    headers: { barz: 'bar' },
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

  it(`msg.send(${rndString}), msg, headers`, async () => {
    const msgIds = await mq.msg.send(options)
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '1', 'send failed')
  })
})

