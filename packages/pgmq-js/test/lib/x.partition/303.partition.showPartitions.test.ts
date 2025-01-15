import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type CreatePartitionedQueueMetaOptions, type ShowPartitionsOptions, PartMsg, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  // const rndString = 'abc0ba'
  const retention = 2
  const createOpts: CreatePartitionedQueueMetaOptions = {
    queue: rndString,
    partitionInterval: '1 month',
    retentionInterval: `${retention} months`,
  }
  const options: ShowPartitionsOptions = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
  })
  after(async () => {
    await mq.destroy()
  })

  describe(`Partition`, () => {

    it(`showPartitions(fakeQueueName) should throw "${PartMsg.queueNotManaged}" with fake name`, async () => {
      const opts: ShowPartitionsOptions = { queue: 'FAKE' }
      try {
        await mq.partition.showPartitions(opts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes(PartMsg.queueNotManaged), ex.message)
        assert(ex.message.includes(opts.queue.toLocaleLowerCase()), ex.message)
        await mq.queue.drop(options)
        return
      }
      assert(false, 'should throw')
    })

    it(`showPartitions(q_${rndString}) should throw "${PartMsg.queueNotManaged}" with queue not partitioned`, async () => {
      await mq.queue.create(options)
      const opts: ShowPartitionsOptions = { queue: `pgmq.q_${rndString}` }
      try {
        await mq.partition.showPartitions(opts)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes(PartMsg.queueNotManaged), ex.message)
        assert(ex.message.includes(opts.queue.toLocaleLowerCase()), ex.message)
        await mq.queue.drop(options)
        return
      }
      assert(false, 'should throw')
    })

    it(`showPartitions(q_${rndString}) should return array with queue partitioned`, async () => {
      await mq.partition.createPartitioned(createOpts)
      const opts: ShowPartitionsOptions = { queue: `pgmq.q_${rndString}` }
      const info = await mq.partition.showPartitions(opts)
      assert(info.length > 0, 'should return partitions')
      console.log({ info })
      await mq.queue.drop(options)
    })

  })
})

