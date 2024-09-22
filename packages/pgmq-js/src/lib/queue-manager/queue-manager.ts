import type { Knex } from 'knex'

import type { QueryResponse, Transaction } from '../knex.types.js'
import type { OptionsBase } from '../types.js'

import type {
  DetachArchiveResp,
  DropResp,
  ListResp,
  MetricsResp,
  PurgeResp,
} from './db.types.js'
import { parseDbQueue, parseQueueMetrics } from './queue.helpers.js'
import { QueueSql } from './queue.sql.js'
import type { Queue, QueueMetrics } from './queue.types.js'


export class QueueManager {

  constructor(protected readonly dbh: Knex) { }

  // #region create

  /**
   * Create a new queue
   * @param name - will be converted to lowercase,
   * Maximum 60 characters; alphanumeric characters, underscores (_) and hyphen (-) are allowed
   * @description * Throws error if queue already exists
   */
  async create(options: OptionsBase): Promise<void> {
    const { queue, trx } = options
    if (await this.hasQueue(options)) {
      throw new Error(`Queue '${queue}' already exists`)
    }
    const query = QueueSql.create
    await this.execute(query, [queue], trx)
  }

  /**
   * Create a new queue without WAL logging
   * @param name - will be converted to lowercase
   * @description * Throws error if queue already exists
   */
  public async createUnlogged(options: OptionsBase) {
    const { queue, trx } = options
    if (await this.hasQueue(options)) {
      throw new Error(`Queue '${queue}' already exists`)
    }
    const query = QueueSql.createUnlogged
    await this.execute(query, [queue], trx)
  }

  /**
   * No error if queue already exists or does not exist
   */
  async hasQueue(options: OptionsBase): Promise<boolean> {
    const { queue: name, trx } = options
    try {
      const list = await this.list(trx)
      for (const queue of list) {
        if (queue.queue === name) {
          return true
        }
      }
      return false
    }
    catch (ex) {
      // list() may throw error queue not found
      console.warn(ex)
      return false
    }
  }

  // #region getOne

  async getOne(options: OptionsBase): Promise<Queue | null> {
    const { queue: name, trx } = options
    const list = await this.list(trx)
    for (const queue of list) {
      if (queue.queue === name) {
        return queue
      }
    }
    return null
  }

  // #region list

  async list(trx?: Transaction | undefined | null): Promise<Queue[]> {
    const query = QueueSql.list
    const res = await this.execute<QueryResponse<ListResp>>(query, null, trx)

    const ret = res.rows.map((row) => {
      const line = row['list_queues']
      return parseDbQueue(line)
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return ret ?? []
  }

  // #region drop

  /**
   * Return false if queue does not exist
   */
  async drop(options: OptionsBase): Promise<boolean> {
    const { queue: name, trx } = options
    const query = QueueSql.drop
    try {
      const res = await this.execute<QueryResponse<DropResp>>(query, [name], trx)
      const [row] = res.rows
      const ret = !! row?.drop_queue
      return ret
    }
    catch (ex) {
      console.warn(ex)
      return false
    }
  }

  // #region purge

  /**
   * Permanently deletes all messages in a queue. Returns the number of messages that were deleted.
   * **NOT delete the queue itself**.
   */
  async purge(options: OptionsBase): Promise<string> {
    const { queue: name, trx } = options
    const query = QueueSql.purge
    const res = await this.execute<QueryResponse<PurgeResp>>(query, [name], trx)
    const [row] = res.rows
    const ret = row?.purge_queue ?? '0'
    return ret
  }

  // #region  detachArchive

  async detachArchive(options: OptionsBase): Promise<void> {
    const { queue: name, trx } = options
    const query = QueueSql.detachArchive
    await this.execute<QueryResponse<DetachArchiveResp>>(query, [name], trx)
  }

  // #region getMetrics

  /**
   * @returns totalMessages visible if out of transaction
   */
  async getMetrics(options: OptionsBase): Promise<QueueMetrics | null> {
    const { queue: name, trx } = options
    const query = QueueSql.getMetrics
    const res = await this.execute<QueryResponse<MetricsResp>>(query, [name], trx)
    const data = res.rows[0]
    const ret = data ? parseQueueMetrics(data) : null
    return ret
  }

  // #region getAllMetrics

  async getAllMetrics(trx?: Transaction | undefined): Promise<QueueMetrics[]> {
    const query = QueueSql.getAllMetrics
    const res = await this.execute<QueryResponse<MetricsResp>>(query, null, trx)
    const ret = res.rows.map(parseQueueMetrics)
    return ret
  }


  protected async execute<T = unknown>(sql: string, params: unknown[] | null, trx: Transaction | undefined | null): Promise<T> {
    const dbh = trx ?? this.dbh
    const res = await (params ? dbh.raw(sql, params) : dbh.raw(sql)) as T
    return res
  }
}

