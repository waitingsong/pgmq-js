import { Inject, Init, Singleton } from '@midwayjs/core'

import type { MsgId, Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { MsgArchiveBatchDto, MsgArchiveDto } from './msg.archive.dto.js'


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

  async archive(options: MsgArchiveDto): Promise<MsgId[]> {
    const { queueName, msgId } = options
    return this.msg.archive(queueName, msgId)
  }

  async archiveBatch(options: MsgArchiveBatchDto): Promise<MsgId[]> {
    const { queueName, msgIds } = options
    return this.msg.archiveBatch(queueName, msgIds)
  }

}

