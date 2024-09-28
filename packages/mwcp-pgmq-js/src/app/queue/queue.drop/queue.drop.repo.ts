import { Inject, Init, Singleton } from '@midwayjs/core'
import type { QueueOptionsBase } from '@waiting/pgmq-js'

import type { Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


@Singleton()
export class QueueDropRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected queue: Pgmq['queue']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.queue = mq.queue
  }

  async drop(options: QueueOptionsBase): Promise<boolean> {
    return this.queue.drop(options)
  }

  async purge(options: QueueOptionsBase): Promise<string> {
    return this.queue.purge(options)
  }

  async detachArchive(options: QueueOptionsBase): Promise<void> {
    await this.queue.detachArchive(options)
  }

}

