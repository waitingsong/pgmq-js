import assert from 'node:assert'

import type { Queue, QueueMetaDto, SendRouteMsgResultItem } from '##/index.js'


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

export function assertSendRouteMsgResultItem(item: unknown): item is SendRouteMsgResultItem {
  assert(typeof item === 'object', 'item not object')
  assert(typeof (item as SendRouteMsgResultItem).msgId === 'string', 'msgId not string')
  assert(typeof (item as SendRouteMsgResultItem).routeId === 'string', 'routeId not string')
  assert(typeof (item as SendRouteMsgResultItem).routeName === 'string', 'routeName not string')
  assert(typeof (item as SendRouteMsgResultItem).queueId === 'string', 'queueId not string')
  assert(typeof (item as SendRouteMsgResultItem).queue === 'string', 'queue not string')
  return true
}

