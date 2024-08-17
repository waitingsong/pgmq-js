import { Inject, Init, Singleton } from '@midwayjs/core'

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

  async drop(name: string): Promise<boolean> {
    return this.queue.drop(name)
  }

  async purge(name: string): Promise<string> {
    return this.queue.purge(name)
  }

  async detachArchive(name: string): Promise<void> {
    await this.queue.detachArchive(name)
  }

}

