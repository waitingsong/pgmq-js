import assert from 'node:assert'

import type { Queue, QueueMetaDto } from '##/index.js'


export function assertQueueRow(queue: Queue | null): queue is Queue {
  assert(queue, 'row not exists')
  assert(queue.queue, 'name not exists')
  assert(queue.createdAt, 'createdAt not exists')
  assert(queue.createdAt instanceof Date, 'createdAt not Date')
  assert(typeof queue.isPartitioned === 'boolean', 'isPartitioned not boolean')
  assert(typeof queue.isUnlogged === 'boolean', 'isUnlogged not boolean')
  return true
}

export function assertQueueMetaRow(queue: QueueMetaDto | null | undefined): queue is QueueMetaDto {
  assert(queue, 'row not exists')
  assert(queue.queue, 'name not exists')
  assert(queue.queueId, 'queueId not exists')
  assert(queue.ctime, 'ctime not exists')
  assert(typeof queue.queueKey === 'string' || queue.queueKey === null, 'queueKey not string or null')
  return true
}
