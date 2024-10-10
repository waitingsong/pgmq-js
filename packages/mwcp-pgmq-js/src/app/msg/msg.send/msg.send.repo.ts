import { Init, Inject, Singleton } from '@midwayjs/core'
import type { SendBatchOptions, SendOptions } from '@waiting/pgmq-js'

import type { MsgId, Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


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

  async send(options: SendOptions): Promise<MsgId[]> {
    return this.msg.send(options)
  }

  async sendBatch(options: SendBatchOptions): Promise<MsgId[]> {
    return this.msg.sendBatch(options)
  }

}

