import assert from 'node:assert'

import type { Knex, QueryResponse, Transaction } from '../knex.types.js'
import type { QueueMetaManager } from '../queue-meta-manager/index.queue-meta.js'
import type { OptionsBase, QueueOptionsBase } from '../types.js'

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

  constructor(
    protected readonly dbh: Knex,
    protected readonly queueMeta: QueueMetaManager,
  ) { }

  // #region create

  /**
   * Create a new queue
   * @param name - will be converted to lowercase,
   * Maximum 60 characters; alphanumeric characters, underscores (_) and hyphen (-) are allowed
   * @description * Throws error if queue already exists
   */
  async create(options: QueueOptionsBase): Promise<string> {
    const opts: QueueOptionsBase = {
      ...options,
      trx: options.trx ?? await this.startTransaction(),
      queue: options.queue.toLowerCase(),
    }
    const { queue, trx } = opts
    assert(trx, 'Transaction is required')

    if (await this.hasQueue(opts)) {
      await trx.rollback()
      throw new Error(`Queue '${queue}' already exists`)
    }

    await this._create(opts)
    const queueId = await this.queueMeta.create(opts)

    if (! options.trx) {
      await trx.commit()
    }
    return queueId
  }

  /**
   * Create a new queue without WAL logging
   * @param name - will be converted to lowercase
   * @description * Throws error if queue already exists
   */
  async createUnlogged(options: QueueOptionsBase) {
    const opts: QueueOptionsBase = {
      ...options,
      trx: options.trx ?? await this.startTransaction(),
      queue: options.queue.toLowerCase(),
    }
    const { queue, trx } = opts
    assert(trx, 'Transaction is required')

    if (await this.hasQueue(opts)) {
      await trx.rollback()
      throw new Error(`Queue '${queue}' already exists`)
    }

    await this._createUnlogged(opts)
    await this.queueMeta.create(opts)

    if (! options.trx) {
      await trx.commit()
    }
  }

  /**
   * No error if queue already exists or does not exist
   */
  async hasQueue(options: QueueOptionsBase): Promise<boolean> {
    const { queue: name, trx } = options

    try {
      const list = await this.list({ trx })
      let found = false
      for (const queue of list) {
        if (queue.queue === name) {
          found = true
          break
        }
      }
      return found
    }
    /* c8 ignore next 5 */
    catch (ex) {
      // list() may throw error queue not found
      console.warn(ex)
      return false
    }
  }

  // #region getOne

  async getOne(options: QueueOptionsBase): Promise<Queue | null> {
    const { queue, trx } = options
    const name = queue.toLowerCase()

    const list = await this.list({ trx })
    for (const queue of list) {
      if (queue.queue === name) {
        return queue
      }
    }
    return null
  }

  // #region list

  async list(options?: OptionsBase): Promise<Queue[]> {
    const sql = QueueSql.list
    const res = await this.execute<QueryResponse<ListResp>>(sql, null, options?.trx)

    const ret = res.rows.map((row) => {
      const line = row['list_queues']
      return parseDbQueue(line)
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return ret ?? []
  }

  // #region drop

  /**
   * Deletes a queue and its archive table.
   * @returns false if queue does not exist
   */
  async drop(options: QueueOptionsBase): Promise<boolean> {
    const opts: QueueOptionsBase = {
      ...options,
      trx: options.trx ?? await this.startTransaction(),
    }
    const { trx } = opts
    assert(trx, 'Transaction is required')

    try {
      await this.queueMeta.delete(opts)
      const ret = await this._drop(opts)
      if (! options.trx) {
        await trx.commit()
      }
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
  async purge(options: QueueOptionsBase): Promise<string> {
    const { queue: name, trx } = options

    const sql = QueueSql.purge
    const res = await this.execute<QueryResponse<PurgeResp>>(sql, [name], trx)
    const [row] = res.rows
    const ret = row?.purge_queue ?? '0'
    return ret
  }

  // #region  detachArchive

  async detachArchive(options: QueueOptionsBase): Promise<void> {
    const { queue: name, trx } = options

    const sql = QueueSql.detachArchive
    await this.execute<QueryResponse<DetachArchiveResp>>(sql, [name], trx)
  }

  // #region getMetrics

  /**
   * @returns totalMessages visible if outside transaction
   */
  async getMetrics(options: QueueOptionsBase): Promise<QueueMetrics | null> {
    const { queue: name, trx } = options

    const sql = QueueSql.getMetrics
    const res = await this.execute<QueryResponse<MetricsResp>>(sql, [name], trx)
    const data = res.rows[0]
    const ret = data ? parseQueueMetrics(data) : null
    return ret
  }

  // #region getAllMetrics

  async getAllMetrics(options?: OptionsBase): Promise<QueueMetrics[]> {
    const sql = QueueSql.getAllMetrics
    const res = await this.execute<QueryResponse<MetricsResp>>(sql, null, options?.trx)
    const ret = res.rows.map(parseQueueMetrics)
    return ret
  }


  protected async execute<T = unknown>(sql: string, params: unknown[] | null, trx: Transaction | undefined | null): Promise<T> {
    if (trx) {
      assert(! trx.isCompleted(), 'parameter trx is completed already')
    }
    const dbh = trx ?? this.dbh
    try {
      const res = await (params ? dbh.raw(sql, params) : dbh.raw(sql)) as T
      return res
    }
    catch (ex) {
      await trx?.rollback()
      throw ex
    }
  }

  protected async startTransaction(): Promise<Transaction> {
    const ret = await this.dbh.transaction()
    assert(ret, 'Transaction is required')
    return ret
  }


  protected async _create(options: QueueOptionsBase): Promise<void> {
    const { queue, trx } = options
    const sql = QueueSql.create
    await this.execute(sql, [queue], trx)
  }

  protected async _createUnlogged(options: QueueOptionsBase) {
    const { queue, trx } = options
    const sql = QueueSql.createUnlogged
    await this.execute(sql, [queue], trx)
  }

  protected async _drop(options: QueueOptionsBase): Promise<boolean> {
    const { queue: name, trx } = options
    const sql = QueueSql.drop
    const res = await this.execute<QueryResponse<DropResp>>(sql, [name], trx)
    const [row] = res.rows
    const ret = !! row?.drop_queue
    return ret
  }
}

