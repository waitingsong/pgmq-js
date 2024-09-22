import { Inject, Init, Singleton } from '@midwayjs/core'
import type { OptionsBase, Transaction } from '@waiting/pgmq-js'

import type { Pgmq, QueueMetrics, QueueMetricsDto } from '##/index.js'
import { convertToDto } from '##/lib/helper.js'
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

  async metrics(options: OptionsBase): Promise<QueueMetricsDto | null> {
    const res = await this.queue.getMetrics(options)
    const ret = res ? convertToDto<QueueMetrics, QueueMetricsDto>(res) : null
    return ret
  }

  async metricsAll(trx?: Transaction | undefined): Promise<QueueMetricsDto[]> {
    const res = await this.queue.getAllMetrics(trx)
    const ret = res.map(convertToDto<QueueMetrics, QueueMetricsDto>)
    return ret
  }
}

