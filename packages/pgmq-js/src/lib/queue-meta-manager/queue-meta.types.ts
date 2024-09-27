/* c8 ignore start */
import type { Transaction } from '../knex.types.js'
import type { OptionsBase } from '../types.js'


export type QueueId = string

export interface QueueMetaDto {
  queue: string
  queueId: QueueId
  queueKey: string | null
  json: object | null
  ctime: string
  mtime: string | null
}

export type GetQueueMetaOptions = OptionsBase

export interface GetQueueMetaByIdOptions {
  queueId: QueueId
  trx?: Transaction | undefined | null
}

export interface ListQueueMetaOptions extends Omit<OptionsBase, 'queue'> {
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

export interface CreateQueueMetaOptions extends OptionsBase {
  queueKey?: string | null
  json?: object | null
}

export type DeleteQueueMetaOptions = OptionsBase


export interface UpdateQueueMetaOptions extends OptionsBase {
  queueId: QueueId
  /**
   * Maximum 512 characters
   */
  queueKey?: string | null
  json?: object | null
}

/* c8 ignore stop */
