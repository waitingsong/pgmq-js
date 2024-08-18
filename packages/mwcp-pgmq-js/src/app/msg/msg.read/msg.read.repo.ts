import { Inject, Init, Singleton } from '@midwayjs/core'

import type { Message, Pgmq } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
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
    const res = await this.msg.read(queueName, vt)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }

  async readWithPoll(options: MsgReadWithPollDto): Promise<MessageDto[]> {
    const { queueName, vt = 1, qty = 1, maxPollSeconds = 5, pollIntervalMs = 100 } = options
    const res = await this.msg.readWithPoll(queueName, vt, qty, maxPollSeconds, pollIntervalMs)
    const ret = res.map(convertToDto<Message, MessageDto>)
    return ret
  }

  async readBatch(options: MsgReadBatchDto): Promise<MessageDto[]> {
    const { queueName, vt = 1, qty = 1 } = options
    const res = await this.msg.readBatch(queueName, vt, qty)
    const ret = res.map(convertToDto<Message, MessageDto>)
    return ret
  }

  // #region setVt

  async setVt(options: MsgSetVtDto): Promise<MessageDto | null> {
    const { queueName, msgId, vtOffset } = options
    const res = await this.msg.setVt(queueName, msgId, vtOffset)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }
}

