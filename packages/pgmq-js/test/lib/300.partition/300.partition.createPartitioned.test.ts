/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type CreatePartitionedQueueMetaOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
// const rndString = 'abcdef'

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
      const sql = `
    SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'dbuser'
  AND table_name = 'part_config_sub';
    `
      const resp = await mq.dbh.raw(sql)
      console.log({ respTable: resp.rows })
      await mq.partition.createPartitioned(createOpts)
    })
  })
})

