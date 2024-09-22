import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { testConfig } from '#@/root.config.js'


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

  it(`queue.purge(${rndString})`, async () => {
    const numString = await mq.queue.purge(createOpts)
    assert(numString === '1', 'purge failed, expect "1" but got: ' + numString)
  })

  it(`queue.purge(FAKE)`, async () => {
    try {
      await mq.queue.purge({ queue: genRandomName(7) })
    }
    catch (ex) {
      assert(ex instanceof Error)
      return
    }
    assert(false, 'should throw Error')
  })

})

