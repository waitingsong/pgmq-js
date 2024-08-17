import { Inject, Init, Singleton } from '@midwayjs/core'

import type { Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { MessageDto } from '../msg.dto.js'

import type {
  MsgReadDto,
  MsgReadWithPollDto,
  MsgReadBatchDto,
  MsgSetVtDto,
} from './msg.read.dto.js'


@Singleton()
export class MsgReadRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async read(options: MsgReadDto): Promise<MessageDto | null> {
    const { queueName, vt = 1 } = options
    return this.msg.read(queueName, vt)
  }

  async readWithPoll(options: MsgReadWithPollDto): Promise<MessageDto[]> {
    const { queueName, vt = 1, qty = 1, maxPollSeconds = 5, pollIntervalMs = 100 } = options
    return this.msg.readWithPoll(queueName, vt, qty, maxPollSeconds, pollIntervalMs)
  }

  async readBatch(options: MsgReadBatchDto): Promise<MessageDto[]> {
    const { queueName, vt = 1, qty = 1 } = options
    return this.msg.readBatch(queueName, vt, qty)
  }

  // #region setVt

  async setVt(options: MsgSetVtDto): Promise<MessageDto | null> {
    const { queueName, msgId, vtOffset } = options
    const res = await this.msg.setVt(queueName, msgId, vtOffset)
    return res ?? null
  }
}

