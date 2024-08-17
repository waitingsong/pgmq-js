import assert from 'node:assert'

import type { Queue } from '##/index.js'


export function assertQueueRow(queue: Queue | null): queue is Queue {
  assert(queue, 'row not exists')
  assert(queue.name, 'name not exists')
  assert(queue.createdAt, 'createdAt not exists')
  assert(queue.createdAt instanceof Date, 'createdAt not Date')
  assert(typeof queue.isPartitioned === 'boolean', 'isPartitioned not boolean')
  assert(typeof queue.isUnlogged === 'boolean', 'isUnlogged not boolean')
  return true
}

