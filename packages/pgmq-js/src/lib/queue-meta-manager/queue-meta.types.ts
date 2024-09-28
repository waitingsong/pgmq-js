/* c8 ignore start */
import type { Transaction } from '../knex.types.js'
import type { QueueOptionsBase } from '../types.js'


export type QueueId = string

export interface QueueMetaDto {
  queue: string
  queueId: QueueId
  queueKey: string | null
  json: object | null
  ctime: string
  mtime: string | null
}

export type GetQueueMetaOptions = QueueOptionsBase

export interface GetQueueMetaByIdOptions {
  queueId: QueueId
  trx?: Transaction | undefined | null
}

export interface ListQueueMetaOptions extends Omit<QueueOptionsBase, 'queue'> {
  /**
   * Maximum get number records
   * @@default 100
   */
  limit?: number
  /**
   * @default routeId
   */
  orderBy?: 'queueId' | 'ctime' | 'mtime'
  /**
   * @default desc
   */
  order?: 'asc' | 'desc'
  /**
   * Get records where queueId is great than (asc) or less then (desc) this value
   */
  relativeQueueId?: QueueId | bigint | number
}

export interface CreateQueueMetaOptions extends QueueOptionsBase {
  queueKey?: string | null
  json?: object | null
}

export type DeleteQueueMetaOptions = QueueOptionsBase


export interface UpdateQueueMetaOptions extends QueueOptionsBase {
  queueId: QueueId
  /**
   * Maximum 512 characters
   */
  queueKey?: string | null
  json?: object | null
}

/* c8 ignore stop */
