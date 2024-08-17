import { Inject, Init, Singleton } from '@midwayjs/core'

import type { Pgmq, QueueMetricsDto } from '##/index.js'
import { PgmqManager } from '##/lib/pgmq-manager.js'


@Singleton()
export class QueueMetricsRepo {
  @Inject() readonly pgmqManager: PgmqManager
  /** default */
  protected queue: Pgmq['queue']

  @Init()
  async init(): Promise<void> {
    const mq = this.pgmqManager.getDataSource('default')
    this.queue = mq.queue
  }

  async metrics(name: string): Promise<QueueMetricsDto | null> {
    return this.queue.getMetrics(name)
  }

  async metricsAll(): Promise<QueueMetricsDto[]> {
    return this.queue.getAllMetrics()
  }
}

