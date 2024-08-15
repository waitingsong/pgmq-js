import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { testConfig } from '#@/root.config.js'


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
    await mq.msg.send(rndString, msgToSend)
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`QueueManager.detachArchive(${rndString})`, async () => {
    const ret = await mq.queue.detachArchive(rndString)
    assert(ret, 'detachArchive() failed')
  })

  it(`QueueManager.detachArchive(FAKE)`, async () => {
    const ret = await mq.queue.detachArchive(genRandomString(7))
    assert(! ret, 'detachArchive() failed')
  })

})

