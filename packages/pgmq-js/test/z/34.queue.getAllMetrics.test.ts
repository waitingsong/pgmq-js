import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
const msgToSend = {
  foo: 'bar',
  rnd: rndString,
}

describe(fileShortPath(import.meta.url), function () {
  this.retries(2)

  let mq: Pgmq
  const createOpts: OptionsBase = { queue: rndString }

  before(async () => {
    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    await mq.msg.send(opts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`QueueManager.getAllMetrics(${rndString})`, async () => {
    const rows = await mq.queue.getAllMetrics()
    assert(rows.length >= 1, 'getAllMetrics failed')
  })

})

