import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type QueueOptionsBase, type SendOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const msgToSend = {
    foo: 'bar',
    rnd: rndString,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    await mq.msg.send(opts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`queue.getOne(${rndString})`, async () => {
    const ret = await mq.queue.getOne(createOpts)
    assert(ret)
  })

  it(`queue.getOne(FAKE)`, async () => {
    const ret = await mq.queue.getOne({ queue: genRandomName(7) })
    assert(! ret, 'hasQueue should return false')
  })

})

