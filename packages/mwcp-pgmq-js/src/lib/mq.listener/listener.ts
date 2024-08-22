import assert from 'node:assert'

import { MS_CONSUMER_KEY, attachPropertyDataToClass } from '@midwayjs/core'

import type { PgmqListenerOptions, PgmqListenerOptionsMetadata } from './listener.types.js'


export function PgmqListener(options: Partial<PgmqListenerOptions> = {}): MethodDecorator {
  return (target: unknown, propertyKey: PropertyKey, descriptor: unknown) => {
    void descriptor
    assert(typeof propertyKey === 'string', 'propertyKey not type string')
    const data: PgmqListenerOptionsMetadata = {
      ...options,
      propertyKey,
    }
    attachPropertyDataToClass(MS_CONSUMER_KEY, data, target, propertyKey)
  }
}
