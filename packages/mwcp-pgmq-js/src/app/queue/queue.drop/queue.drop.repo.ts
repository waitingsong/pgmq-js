import { Inject, Init, Singleton } from '@midwayjs/core'
import type { OptionsBase } from '@waiting/pgmq-js'

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

  async drop(options: OptionsBase): Promise<boolean> {
    return this.queue.drop(options)
  }

  async purge(options: OptionsBase): Promise<string> {
    return this.queue.purge(options)
  }

  async detachArchive(options: OptionsBase): Promise<void> {
    await this.queue.detachArchive(options)
  }

}

