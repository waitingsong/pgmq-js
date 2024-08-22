import assert from 'node:assert'

import { Singleton, Init, Inject } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Consumer, ConsumerMessageDto, PgmqListener, PgmqManager } from '../types/index.js'
import { ConfigKey } from '../types/lib-types.js'
import type { Config, MiddlewareConfig } from '../types/lib-types.js'


@Consumer()
@Singleton()
export class ConsumerTestService {

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() protected readonly pgmqManager: PgmqManager

  readonly q1 = 'q1'
  readonly q2 = 'q2'
  readonly q3 = 'q3'
  readonly q4 = 'q4'

  readonly msgs1: ConsumerMessageDto[] = []
  readonly msgs2: ConsumerMessageDto[] = []
  readonly msgs3: ConsumerMessageDto[] = []
  readonly msgs4: ConsumerMessageDto[] = []

  @Init()
  async init(): Promise<void> {
    const pgmq = this.pgmqManager.getDataSource('default')
    assert(pgmq, `pgmq data source 'default' not found`)

    await pgmq.queue.create(this.q1).catch((err) => {
      assert(err instanceof Error)
      if (err.message.includes('already exists')) { return }
      throw err
    })
    await pgmq.queue.create(this.q2).catch(() => { return })
    await pgmq.queue.create(this.q3).catch(() => { return })
    await pgmq.queue.create(this.q4).catch(() => { return })
  }

  @PgmqListener({ queueName: 'q1' })
  @PgmqListener({ queueName: ['q2', 'q3'], consumeAction: 'archive' })
  @PgmqListener({ queueName: ['q4'] })
  async hello(msg: ConsumerMessageDto): Promise<void> {
    switch (msg.queueName) {
      case this.q1:
        this.msgs1.push(msg)
        break

      case this.q2:
        this.msgs2.push(msg)
        break

      case this.q3:
        this.msgs3.push(msg)
        break

      case this.q4:
        this.msgs4.push(msg)
        break
    }
  }

}

