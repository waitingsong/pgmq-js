import { Init, Inject, Singleton } from '@midwayjs/core'
import type { ReadBatchOptions, ReadOptions, ReadWithPollOptions, SetVtOptions } from '@waiting/pgmq-js'

import type { Message, Pgmq } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { MessageDto } from '../msg.dto.js'


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

  async read(options: ReadOptions): Promise<MessageDto | null> {
    const res = await this.msg.read(options)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }

  async readWithPoll(options: ReadWithPollOptions): Promise<MessageDto[]> {
    const res = await this.msg.readWithPoll(options)
    const ret = res.map(convertToDto<Message, MessageDto>)
    return ret
  }

  async readBatch(options: ReadBatchOptions): Promise<MessageDto[]> {
    const res = await this.msg.readBatch(options)
    const ret = res.map(convertToDto<Message, MessageDto>)
    return ret
  }

  // #region setVt

  async setVt(options: SetVtOptions): Promise<MessageDto | null> {
    const res = await this.msg.setVt(options)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }
}

