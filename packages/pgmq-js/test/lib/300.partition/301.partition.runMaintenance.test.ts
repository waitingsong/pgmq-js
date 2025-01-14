/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    const resp = await mq.dbh.raw(sql)
    console.log({ resp: resp.rows })

    const sql2 = 'SELECT current_schema();'
    const resp2 = await mq.dbh.raw(sql2)
    console.log({ resp2: resp2.rows })

//     const sqlExt = `
//     SELECT e.extname AS extension_name,
//    n.nspname AS schema_name,
//    r.rolname AS owner
// FROM pg_extension e
// JOIN pg_authid r ON e.extowner = r.oid
// JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
// WHERE e.extname = 'pgmq' OR e.extname = 'pg_partman'; `
//     const respExt = await mq.dbh.raw(sqlExt)
//     console.log({ respExt: respExt.rows })

    const sql3 = `SELECT proname, nspname
FROM pg_catalog.pg_proc
JOIN pg_catalog.pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE proname = 'run_maintenance'`
    const resp3 = await mq.dbh.raw(sql3)
    console.log({ resp3: resp3.rows })

    // const path = 'SET search_path TO "$user", public, pgmq'
    // await mq.dbh.raw(path)

    const sql4 = 'SHOW search_path'
    const resp4 = await mq.dbh.raw(sql4)
    console.log({ resp4: resp4.rows })

    // const sql5 = 'SELECT pgmq.run_maintenance()'
    // await mq.dbh.raw(sql5)

    await mq.partition.createPartitioned(createOpts)
  })
  after(async () => {
    await sleep(3000)
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

