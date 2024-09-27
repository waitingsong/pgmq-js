/* c8 ignore start */
import type { QueueId } from './queue-meta.types.js'


export interface QueueMetaDo {
  queue_id: QueueId
  queue_name: string
  queue_key: string | null
  json: object | null
  ctime: Date
  mtime: Date | null
}


/* c8 ignore stop */
