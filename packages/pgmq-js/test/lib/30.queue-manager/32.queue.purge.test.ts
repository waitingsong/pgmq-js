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

  it(`queue.purge(${rndString})`, async () => {
    const numString = await mq.queue.purge(rndString)
    assert(numString === '1', 'purge failed, expect "1" but got: ' + numString)
  })

  it(`queue.purge(FAKE)`, async () => {
    try {
      await mq.queue.purge(genRandomString(7))
    }
    catch (ex) {
      assert(ex instanceof Error)
      return
    }
    assert(false, 'should throw Error')
  })

})

