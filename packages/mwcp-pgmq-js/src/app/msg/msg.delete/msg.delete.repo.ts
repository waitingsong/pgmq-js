import { Inject, Init, Singleton } from '@midwayjs/core'

import type { Message, MsgId, Pgmq } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { CommonMsgDto, MessageDto } from '../msg.dto.js'

import type { MsgDeleteDto, MsgDeleteBatchDto } from './msg.delete.dto.js'


@Singleton()
export class MsgDeleteRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async pop(options: CommonMsgDto): Promise<MessageDto | null> {
    const { queueName } = options
    const res = await this.msg.pop(queueName)
    const ret = res ? convertToDto<Message, MessageDto>(res) : null
    return ret
  }

  async delete(options: MsgDeleteDto): Promise<MsgId[]> {
    const { queueName, msgId } = options
    return this.msg.delete(queueName, msgId)
  }

  async deleteBatch(options: MsgDeleteBatchDto): Promise<MsgId[]> {
    const { queueName, msgIds } = options
    return this.msg.deleteBatch(queueName, msgIds)
  }

}

