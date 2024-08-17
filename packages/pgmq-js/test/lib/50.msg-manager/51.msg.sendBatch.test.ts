import assert from 'node:assert'

import { fileShortPath, genRandomString } from '@waiting/shared-core'

import { Pgmq } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomString(6)

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

  it(`msg.sendBatch(${rndString}, msg[])`, async () => {
    const msg = {
      foo: 'bar',
    }
    const msgIds = await mq.msg.sendBatch(rndString, [msg, msg])
    assert(msgIds.length === 2, 'sendBatch failed')
    assert(msgIds[0] === '1', `sendBatch failed: ${msgIds[0]}`)
    assert(msgIds[1] === '2', `sendBatch failed: ${msgIds[1]}`)
  })

})

