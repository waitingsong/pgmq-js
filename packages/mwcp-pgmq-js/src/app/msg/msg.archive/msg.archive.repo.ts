import { Init, Inject, Singleton } from '@midwayjs/core'
import type { DeleteBatchOptions, DeleteOptions } from '@waiting/pgmq-js'

import type { MsgId, Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


@Singleton()
export class MsgArchiveRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected msg: Pgmq['msg']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.msg = mq.msg
  }

  async archive(options: DeleteOptions): Promise<MsgId[]> {
    return this.msg.archive(options)
  }

  async archiveBatch(options: DeleteBatchOptions): Promise<MsgId[]> {
    return this.msg.archiveBatch(options)
  }

}

