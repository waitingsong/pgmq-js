import type { ConsumerOptions } from '##/lib/mq.consumer/index.consumer.js'


export interface PgmqListenerOptions extends ConsumerOptions {
  queueName: string | string[]
}

export interface PgmqListenerOptionsMetadata extends Partial<PgmqListenerOptions> {
  propertyKey: string
}


