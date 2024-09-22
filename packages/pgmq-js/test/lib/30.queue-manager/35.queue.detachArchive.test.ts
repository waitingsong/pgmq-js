import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName, type OptionsBase, type SendOptions } from '##/index.js'
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
    const opts: SendOptions = {
      queue: rndString,
      msg: msgToSend,
    }
    await mq.msg.send(opts)
  })
  after(async () => {
    await mq.queue.drop(createOpts) // queue will not be dropped case of archived
    await mq.destroy()
  })

  it(`queue.detachArchive(${rndString})`, async () => {
    await mq.queue.detachArchive(createOpts)
  })

  it(`queue.detachArchive(FAKE)`, async () => {
    try {
      await mq.queue.detachArchive({ queue: genRandomName(7) })
    }
    catch (ex) {
      assert(ex instanceof Error)
      return
    }
    assert(false, 'should throw Error')
  })

})

