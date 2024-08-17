import assert from 'node:assert'

import type { MetricsResp, QueueString } from './db.types.js'
import type { Queue, QueueMetrics } from './queue.types.js'


type QueueRow = [Name, IsPartitioned, IsUnlogged, CreatedAt]
type Name = string
type CreatedAt = `"${string}"`
type IsPartitioned = 't' | 'f'
type IsUnlogged = 't' | 'f'

export function parseDbQueue(queue: QueueString): Queue {
  const parts = queue.slice(1, -1).split(',') as QueueRow
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  assert(parts.length === 4, `Invalid queue string: ${queue}`)

  const [name, isPartitioned, isUnlogged, createdAt] = parts
  const time = new Date(createdAt.slice(1, -1))
  assert(time instanceof Date, `Invalid date format: ${createdAt}`)

  const ret = {
    name,
    createdAt: time,
    isPartitioned: isPartitioned === 't',
    isUnlogged: isUnlogged === 't',
  }
  return ret
}

export function parseQueueMetrics(input: MetricsResp): QueueMetrics {
  const ret = {
    queueName: input.queue_name,
    queueLength: input.queue_length,
    newestMsgAgeSec: input.newest_msg_age_sec === null ? null : parseInt(input.newest_msg_age_sec, 10),
    oldestMsgAgeSec: input.oldest_msg_age_sec === null ? null : parseInt(input.oldest_msg_age_sec, 10),
    totalMessages: input.total_messages,
    scrapeTime: new Date(input.scrape_time),
  }
  return ret
}

