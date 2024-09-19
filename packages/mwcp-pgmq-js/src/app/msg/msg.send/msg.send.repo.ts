import { Inject, Init, Singleton } from '@midwayjs/core'

import type { MsgId, Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { MsgSendBatchDto, MsgSendDto } from './msg.send.dto.js'


@Singleton()
export class MsgSendRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async send(options: MsgSendDto): Promise<MsgId[]> {
    return this.msg.send(options)
  }

  async sendBatch(options: MsgSendBatchDto): Promise<MsgId[]> {
    return this.msg.sendBatch(options)
  }

}

