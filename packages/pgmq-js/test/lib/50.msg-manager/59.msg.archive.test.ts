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

  it(`msg.archive(${rndString})`, async () => {
    const msgIds = await mq.msg.send(rndString, msgToSend)
    assert(msgIds[0])
    const ret = await mq.msg.archive(rndString, msgIds[0])
    assert(ret.length === 1, 'archive failed')
    assert(ret[0] === msgIds[0], 'archive failed')
  })
})

