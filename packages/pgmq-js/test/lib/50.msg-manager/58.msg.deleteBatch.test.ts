import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


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
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.deleteBatch(${rndString})`, async () => {
    const fakeId = '999'
    const msgIds = await mq.msg.sendBatch(rndString, [msgToSend, msgToSend])
    const deletedMsgIds = await mq.msg.deleteBatch(rndString, [...msgIds, fakeId])
    assert(deletedMsgIds.length === 2, 'deleteBatch() failed')
    assert(deletedMsgIds.includes(fakeId) === false, 'deleteBatch() failed')
  })
})

