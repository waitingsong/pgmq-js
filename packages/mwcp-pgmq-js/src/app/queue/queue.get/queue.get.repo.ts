import { Inject, Init, Singleton } from '@midwayjs/core'

import type { Pgmq, Queue } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


@Singleton()
export class QueueGetRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected queue: Pgmq['queue']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.queue = mq.queue
  }

  async hasQueue(name: string): Promise<boolean> {
    return this.queue.hasQueue(name)
  }

  async getOne(name: string): Promise<Queue | null> {
    return this.queue.getOne(name)
  }

  async list(): Promise<Queue[]> {
    return this.queue.list()
  }

}

