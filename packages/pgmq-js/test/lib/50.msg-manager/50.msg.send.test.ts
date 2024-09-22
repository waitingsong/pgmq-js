import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const msg = {
    foo: 'bar',
  }
  const opts: SendOptions = {
    queue: rndString,
    msg,
  }
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.send(${rndString}, msg)`, async () => {
    const msgIds = await mq.msg.send(opts)
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '1', 'send failed')
  })

  it(`msg.send(${rndString}), msg`, async () => {
    const msgIds = await mq.msg.send(opts)
    assert(msgIds.length === 1, 'send failed')
    assert(msgIds[0] === '2', 'send failed')
  })
})

