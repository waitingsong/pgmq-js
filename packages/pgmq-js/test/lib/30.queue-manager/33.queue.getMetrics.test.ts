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
  })
  after(async () => {
    await mq.queue.drop(rndString)
    await mq.destroy()
  })

  it(`queue.getMetrics(${rndString})`, async () => {
    const row = await mq.queue.getMetrics(rndString)
    assert(row, 'getMetrics failed')
    assert(row.newestMsgAgeSec === null, 'getMetrics failed')
    assert(row.oldestMsgAgeSec === null, 'getMetrics failed')
    assert(row.queueLength === '0', 'getMetrics failed')
    assert(row.queueName === rndString, 'getMetrics failed')
    assert(row.scrapeTime, 'getMetrics failed')
    assert(row.totalMessages === '0', 'getMetrics failed')
  })

  it(`queue.getMetrics(${rndString}) after send()`, async () => {
    await mq.msg.send(rndString, msgToSend)

    const row = await mq.queue.getMetrics(rndString)
    assert(row, 'getMetrics failed')
    console.log(row)
    assert(row.newestMsgAgeSec === 0, 'getMetrics failed')
    assert(row.oldestMsgAgeSec === 0, 'getMetrics failed')
    assert(row.queueLength === '1', 'getMetrics failed')
    assert(row.queueName === rndString, 'getMetrics failed')
    assert(row.scrapeTime, 'getMetrics failed')
    assert(row.totalMessages === '1', 'getMetrics failed')
  })

  it(`queue.getMetrics(FAKE)`, async () => {
    try {
      await mq.queue.getMetrics(genRandomString(7))
    }
    catch (ex) {
      assert(ex instanceof Error)
      return
    }
    assert(false, 'should throw Error')
  })

})

