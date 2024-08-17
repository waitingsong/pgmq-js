import assert from 'node:assert/strict'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
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
    await mq.msg.send(rndString, msgToSend)
  })
  after(async () => {
    await mq.queue.drop(rndString) // queue will not be dropped case of archived
    await mq.destroy()
  })

  it(`queue.detachArchive(${rndString})`, async () => {
    await mq.queue.detachArchive(rndString)
  })

  it(`queue.detachArchive(FAKE)`, async () => {
    try {
      await mq.queue.detachArchive(genRandomString(7))
    }
    catch (ex) {
      assert(ex instanceof Error)
      return
    }
    assert(false, 'should throw Error')
  })

})

