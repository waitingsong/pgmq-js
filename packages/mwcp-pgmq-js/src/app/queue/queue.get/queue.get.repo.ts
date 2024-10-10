import { Init, Inject, Singleton } from '@midwayjs/core'
import type { OptionsBase, QueueOptionsBase } from '@waiting/pgmq-js'

import type { Pgmq, Queue } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'

import type { QueueDto } from '../queue.dto.js'


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

  async hasQueue(options: QueueOptionsBase): Promise<boolean> {
    return this.queue.hasQueue(options)
  }

  async getOne(options: QueueOptionsBase): Promise<QueueDto | null> {
    const res = await this.queue.getOne(options)
    const ret = res ? convertToDto<Queue, QueueDto>(res) : null
    return ret
  }

  async list(options?: OptionsBase): Promise<QueueDto[]> {
    const res = await this.queue.list(options)
    const ret = res.map(convertToDto<Queue, QueueDto>)
    return ret
  }

}

