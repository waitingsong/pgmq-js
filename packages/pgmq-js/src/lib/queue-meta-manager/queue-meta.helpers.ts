import type { QueueMetaDo } from './db.types.js'
import type { QueueMetaDto } from './queue-meta.types.js'


export function parseQueueMeta(input: QueueMetaDo): QueueMetaDto {
  const ret: QueueMetaDto = {
    queue: input.queue_name,
    queueId: input.queue_id,
    queueKey: input.queue_key,
    json: input.json,
    ctime: input.ctime.toISOString(),
    mtime: input.mtime?.toISOString() ?? null,
  }
  return ret
}

