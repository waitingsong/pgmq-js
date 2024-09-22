import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type DeleteOptions, type OptionsBase, type SendOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.archive(${rndString})`, async () => {
    const sendOpts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    const msgIds = await mq.msg.send(sendOpts)
    assert(msgIds[0])

    const opts: DeleteOptions = {
      queue: rndString,
      msgId: msgIds[0],
    }
    const ret = await mq.msg.archive(opts)
    assert(ret.length === 1, 'archive failed')
    assert(ret[0] === msgIds[0], 'archive failed')
  })
})

