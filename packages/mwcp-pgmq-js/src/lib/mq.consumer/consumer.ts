import { MS_CONSUMER_KEY, saveClassMetadata, saveModule } from '@midwayjs/core'

import type { ConsumerMetadata, ConsumerOptions } from './consumer.types.js'


export function Consumer(options?: Partial<ConsumerOptions>): ClassDecorator {
  return (target: unknown) => {
    saveModule(MS_CONSUMER_KEY, target)

    const metadata: ConsumerMetadata = { type: 'pgmq', metadata: options ?? {} }
    saveClassMetadata(MS_CONSUMER_KEY, metadata, target)
  }
}
