/* c8 ignore start */

import type { QueueOptionsBase } from '../types.js'


export interface ShowPartitions {
  partitionSchemaname: string
  partitionTablename: string
}

/**
 * @link https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#show_partitions
 */
export interface ShowPartitionsOptions extends QueueOptionsBase {
  /**
   * @default 'ASC'
   */
  order?: 'ASC' | 'DESC'
  /**
   * @default false
   */
  includeDefault?: boolean
}

export enum PartMsg {
  queueNotManaged = 'Given parent table not managed by pg_partman',
}


/**
 * @link https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned
 * @link https://tembo-io.github.io/pgmq/#partitioned-queues
 */
export interface CreatePartitionedQueueMetaOptions extends QueueOptionsBase {
  /**
   * Pgsql Duration (eg. '1 days') or number string (eg. '100000')
   * @default '1 month'
   */
  partitionInterval?: string
  /**
   * Pgsql Duration (eg. '1 year') or number string (eg. '10000000')
   * @default '1 year'
   */
  retentionInterval?: string
  /**
   * Maximum 512 characters
   */
  queueKey?: string | null
  json?: object | null
}


/**
 * @link https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#run_maintenance
 */
export interface RunMaintenanceOptions {
  /**
   * Must prefix with schema name, like 'public.my_queue'
   */
  queue?: string
  /**
   * @default false
   */
  analyze?: boolean
  /**
   * @default true
   */
  jobmon?: boolean
}


/* c8 ignore stop */
