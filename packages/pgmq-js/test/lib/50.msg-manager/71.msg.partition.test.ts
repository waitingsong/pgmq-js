import assert from 'node:assert'

import { fileShortPath, sleep } from '@waiting/shared-core'

import { type CreatePartitionedQueueMetaOptions, type DeleteBatchOptions, type QueueOptionsBase, type ReadBatchOptions, type SendBatchOptions, Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


const rndString = genRandomName(6)
// const rndString = 'abc0ba'

describe(fileShortPath(import.meta.url), () => {
  let mq: Pgmq
  let index = 0
  const loop = 10
  const msgItem = {
    foo: 'bar',
    index,
  }
  const msgsToSend: (typeof msgItem)[] = []
  const msgs2ToSend: (typeof msgItem)[] = []
  for (let i = 0; i < loop; i++) {
    msgsToSend.push({ ...msgItem, index })
    index += 1
  }
  for (let i = 0; i < loop; i++) {
    msgs2ToSend.push({ ...msgItem, index })
    index += 1
  }
  const opts: SendBatchOptions = {
    queue: rndString,
    msgs: msgsToSend,
  }
  const opts2: SendBatchOptions = {
    queue: rndString,
    msgs: msgs2ToSend,
  }
  const createOpts: CreatePartitionedQueueMetaOptions = {
    queue: rndString,
    partitionInterval: '1min',
    retentionInterval: '2mins',
  }

  before(async () => {
    mq = new Pgmq('test', dbConfig)
    try {
      await mq.partition.createPartitioned(createOpts)
    }
    catch (ex) {
      console.log(ex)
    }
    console.log({ name: rndString })
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.sendBatch(${rndString}, msg[])`, async () => {
    const msgIds = await mq.msg.sendBatch(opts)
    assert(msgIds.length === loop, 'sendBatch failed len:' + msgIds.length)
    console.log({ msgIds })
    const msgIds2 = await mq.msg.sendBatch(opts2)
    assert(msgIds2.length === loop, 'sendBatch2 failed len:' + msgIds.length)

    const arOpts: DeleteBatchOptions = {
      queue: rndString,
      msgIds: [...msgIds],
    }
    const ids = await mq.msg.archiveBatch(arOpts)
    console.log({ ids })
  })

  it(`Validate q_${rndString}_default empty`, async () => {
    const tbl = `pgmq.q_${rndString}_default`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resp = await mq.dbh.raw(`SELECT * FROM ${tbl}`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert(resp.rowCount === 0, 'rowCount not 0')
  })

  it(`Validate a_${rndString}_default empty`, async () => {
    const tbl = `pgmq.a_${rndString}_default`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const resp = await mq.dbh.raw(`SELECT * FROM ${tbl}`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert(resp.rowCount === 0, 'rowCount not 0')
  })
})

