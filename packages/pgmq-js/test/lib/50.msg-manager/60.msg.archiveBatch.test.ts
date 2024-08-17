import assert from 'node:assert'

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
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`msg.archiveBatch(${rndString})`, async () => {
    const fakeMsgId = '999999999'
    const msgIds = await mq.msg.sendBatch(rndString, [msgToSend, msgToSend])
    const ids = await mq.msg.archiveBatch(rndString, [...msgIds, fakeMsgId])
    assert(ids.length === 2, 'archiveBatch failed')
    assert(! ids.includes(fakeMsgId), 'archiveBatch failed')
  })
})

