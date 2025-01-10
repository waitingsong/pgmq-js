import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import {
  type CreatePartitionedQueueMetaOptions,
  type RunMaintenanceOptions,
  type ShowPartitionsOptions,
  Pgmq, genRandomName,
} from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  const rndString = genRandomName(6)
  const createOpts: CreatePartitionedQueueMetaOptions = {
    queue: rndString,
  }
  const options: ShowPartitionsOptions = { queue: rndString }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    const sql = 'SELECT extname, extversion FROM pg_extension;'
    const resp = await mq.dbh.raw(sql) as unknown
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ resp: resp.rows })

    const sql2 = 'SELECT current_schema();'
    const resp2 = await mq.dbh.raw(sql2) as unknown
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ resp2: resp2.rows })

    const sql3 = `SELECT proname, nspname
FROM pg_catalog.pg_proc
JOIN pg_catalog.pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE proname = 'run_maintenance'`

    const resp3 = await mq.dbh.raw(sql3) as unknown
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ resp3: resp3.rows })

    // const path = 'SET search_path TO "$user", public, pgmq'
    // await mq.dbh.raw(path)

    const sql4 = 'SHOW search_path'
    const resp4 = await mq.dbh.raw(sql4) as unknown
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ resp4: resp4.rows })

    // const sql5 = 'SELECT run_maintenance()'
    // await mq.dbh.raw(sql5)

    await mq.partition.createPartitioned(createOpts)
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  describe(`Partition`, () => {

    it(`runMaintenance()`, async () => {
      await mq.partition.runMaintenance()
    })

    it(`runMaintenance(pgmq.q_${rndString})`, async () => {
      const opts: RunMaintenanceOptions = { queue: `pgmq.q_${rndString}` }
      await mq.partition.runMaintenance(opts)
    })

  })
})

