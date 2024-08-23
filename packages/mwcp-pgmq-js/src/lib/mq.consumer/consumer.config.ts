import type { ConsumerOptions } from './consumer.types.js'


export const initConsumerOptions: ConsumerOptions = {
  sourceName: 'default',
  qty: 10,
  vt: 1,
  autoCreateQueue: true,
  consumeAction: 'delete',
  consumeActionAt: 'after',
  queueConnectionNumber: 1,
  maxPollSeconds: 2,
  pollIntervalMs: 100,
}

