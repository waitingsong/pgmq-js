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

  it(`queue.getOne(${rndString})`, async () => {
    const ret = await mq.queue.getOne(rndString)
    assert(ret)
  })

  it(`queue.getOne(FAKE)`, async () => {
    const ret = await mq.queue.getOne(genRandomString(7))
    assert(! ret, 'hasQueue should return false')
  })

})

