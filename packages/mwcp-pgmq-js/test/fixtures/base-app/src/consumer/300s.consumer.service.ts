import { Singleton } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Consumer, ConsumerMessageDto, PgmqListener } from '../types/index.js'
import { ConfigKey } from '../types/lib-types.js'
import type { Config, MiddlewareConfig } from '../types/lib-types.js'


@Consumer()
@Singleton()
export class ConsumerTestService {

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  readonly q1 = 'q1'
  readonly q2 = 'q2'
  readonly q3 = 'q3'
  readonly q4 = 'q4'

  readonly msgs1: ConsumerMessageDto[] = []
  readonly msgs2: ConsumerMessageDto[] = []
  readonly msgs3: ConsumerMessageDto[] = []
  readonly msgs4: ConsumerMessageDto[] = []

  @PgmqListener({ queue: 'q1' })
  @PgmqListener({ queue: ['q2', 'q3'], consumeAction: 'archive' })
  @PgmqListener({ queue: ['q4'] })
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

