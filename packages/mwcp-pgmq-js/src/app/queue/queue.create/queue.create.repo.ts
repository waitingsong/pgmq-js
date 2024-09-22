import { Inject, Init, Singleton } from '@midwayjs/core'
import type { OptionsBase } from '@waiting/pgmq-js'

import type { Pgmq } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


@Singleton()
export class QueueCreateRepo {
  @Inject() private readonly pgmqManager: PgmqManager
  /** default */
  protected queue: Pgmq['queue']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.queue = mq.queue
  }

  async create(options: OptionsBase): Promise<void> {
    await this.queue.create(options)
  }

  async createUnlogged(options: OptionsBase): Promise<void> {
    await this.queue.createUnlogged(options)
  }

}

