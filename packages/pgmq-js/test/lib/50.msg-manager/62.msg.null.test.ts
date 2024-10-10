import assert from 'node:assert'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { type QueueOptionsBase, type ReadOptions, type SendOptions, Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)

    const opts: SendOptions = {
      queue: rndString,
      msg: null,
    }
    await mq.msg.send(opts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`send null and then read it`, async () => {
    const opts: ReadOptions = {
      queue: rndString,
    }
    const msg = await mq.msg.read(opts)
    assert(msg)
    assert(msg.msgId === '1')
    assert(msg.message === null, 'msg.message not exist')
    assert(msg.enqueuedAt, 'msg.enqueuedAt not exist')
    assert(new Date(msg.enqueuedAt).getTime() > 0, 'msg.enqueuedAt invalid')
    assert(msg.readCt === 1, 'msg.readCt not equal 1')
    assert(msg.vt, 'msg.vt not exist')
    assert(new Date(msg.vt).getTime() > 0, 'msg.vt invalid')
  })
})

