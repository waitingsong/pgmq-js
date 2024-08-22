import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'
import { testConfig } from '#@/root.config.js'


const rndString = genRandomName(6)
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

  it(`queue.hasQueue(${rndString})`, async () => {
    const ret = await mq.queue.hasQueue(rndString)
    assert(ret === true, 'hasQueue should return true')
  })

  it(`queue.hasQueue(FAKE)`, async () => {
    const ret = await mq.queue.hasQueue(genRandomName(7))
    assert(! ret, 'hasQueue should return false')
  })

})

