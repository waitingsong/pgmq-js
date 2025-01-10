import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type CreatePartitionedQueueMetaOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
// const rndString = 'abc0ba'

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const createOpts: CreatePartitionedQueueMetaOptions = {
    queue: rndString,
    partitionInterval: '1min',
    retentionInterval: '2mins',
  }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  describe(`Partition.createPartitioned(${rndString})`, () => {
    it(`normal`, async () => {
      await mq.partition.createPartitioned(createOpts)
    })
  })
})

