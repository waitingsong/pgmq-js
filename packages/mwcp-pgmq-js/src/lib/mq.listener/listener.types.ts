import type { ConsumerOptions } from '##/lib/mq.consumer/index.consumer.js'


export interface PgmqListenerOptions extends ConsumerOptions {
  queue: string | string[]
}

export interface PgmqListenerOptionsMetadata extends Partial<PgmqListenerOptions> {
  propertyKey: string
}


