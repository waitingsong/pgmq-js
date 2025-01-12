import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type CreatePartitionedQueueMetaOptions, type ShowPartitionsOptions, PartMsg, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'

/* RUN:
-- database/default/ddl/ci-config.sql
ALTER SYSTEM SET pg_partman_bgw.interval = 2
SELECT pg_reload_conf();
*/

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
    it(`showPartitions(q_${rndString}) should return array with queue partitioned after runMaintenance with name`, async () => {
      await mq.partition.createPartitioned(createOpts)
      const opts: ShowPartitionsOptions = { queue: `pgmq.q_${rndString}` }
      const info = await mq.partition.showPartitions(opts)
      assert(info.length === 9, 'should return partitions')

      await mq.partition.runMaintenance({ queue: `pgmq.q_${rndString}` })
      await sleep(2000)
      const info2 = await mq.partition.showPartitions(opts)
      assert(info2.length === 7, 'should partitions maintained, length: ' + info2.length)
      console.log({ info2 })

      await mq.queue.drop(options)
    })

    it(`showPartitions(q_${rndString}) should return array with queue partitioned after runMaintenance`, async () => {
      await mq.partition.createPartitioned(createOpts)
      const opts: ShowPartitionsOptions = { queue: `pgmq.q_${rndString}` }
      const info = await mq.partition.showPartitions(opts)
      assert(info.length === 9, 'should return partitions')

      await mq.partition.runMaintenance()
      await sleep(2000)
      const info2 = await mq.partition.showPartitions(opts)
      assert(info2.length === 7, 'should partitions maintained')
      console.log({ info2 })

      await mq.queue.drop(options)
    })

  })

})

