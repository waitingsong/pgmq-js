import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import type { Message, QueueOptionsBase, ReadOptions, SendBatchOptions, SendOptions } from '##/index.js'
import { Pgmq, genRandomName } from '##/index.js'
import { dbConfig } from '#@/config.unittest.js'


interface MsgContent {
  key: string
  data: {
    rnd: number,
  }
}

describe(fileShortPath(import.meta.url), () => {
  const rndString = genRandomName(6)
  const msgToSend: MsgContent = {
    key: 'foo',
    data: {
      rnd: 1,
    },
  }
  const msgToSend2: MsgContent = {
    key: 'bar',
    data: {
      rnd: 2,
    },
  }

  let mq: Pgmq
  const options: ReadOptions = {
    queue: rndString,
  }
  const createOpts: QueueOptionsBase = { queue: rndString }

  before(async () => {
    const opts: SendBatchOptions = {
      queue: rndString,
      msgs: [msgToSend, msgToSend2],
    }
    mq = new Pgmq('test', dbConfig)
    await mq.queue.createUnlogged(createOpts)
    const msgIds = await mq.msg.sendBatch(opts)
    assert(msgIds.length === 2, 'sendBatch failed at before()')
  })
  after(async () => {
    await mq.queue.drop(createOpts)
    await mq.destroy()
  })

  it(`msg.read(${rndString} with conditional)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        key: 'foo',
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs)
    assert(msgs.length === 1, 'msg.readBatch failed')
    const [msg] = msgs
    assert(msg)
    assert(msg.message, 'msg.message not exist')
    assert(msg.message.key === 'foo', 'msg.message.key not equal foo')
  })

  it(`msg.read(${rndString} with conditional 2)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        key: 'foo',
        data: {
          rnd: 1,
        },
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs.length === 1, 'msg.readBatch failed')
    const [msg] = msgs
    assert(msg)
    assert(msg.message, 'msg.message not exist')
    assert(msg.message.key === 'foo', 'msg.message.key not equal foo')
  })

  it(`msg.read(${rndString} with conditional 3)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        data: {
          rnd: 1,
        },
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs.length === 1, 'msg.readBatch failed')
    const [msg] = msgs
    assert(msg)
    assert(msg.message, 'msg.message not exist')
    assert(msg.message.key === 'foo', 'msg.message.key not equal foo')
  })


  it(`msg.read(${rndString} with conditional 4)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        key: 'foo',
        data: {
          rnd: 9,
        },
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs.length === 0, 'msg.readBatch should return empty array')
  })

  it(`msg.read(${rndString} with conditional 5)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        key: 'foo',
        data: {
          rnd: 1,
          fake: '',
        },
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs.length === 0, 'msg.readBatch should return empty array')
  })

  it(`msg.read(${rndString} with conditional 6)`, async () => {
    const opts: ReadOptions = {
      ...options,
      vt: 0,
      conditional: {
        data: {
          fake: '',
        },
      },
    }
    const msgs = await mq.msg.readBatch<MsgContent>(opts)
    assert(msgs.length === 0, 'msg.readBatch should return empty array')
  })
})

