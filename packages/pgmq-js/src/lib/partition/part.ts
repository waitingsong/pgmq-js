import assert from 'node:assert'

import type { Knex, QueryResponse, Transaction } from '../knex.types.js'
import type { QueueMetaManager } from '../queue-meta-manager/index.queue-meta.js'

import type { ShowPartitionsRecord } from './db.types.js'
import { parseShowPartitionRecord } from './part.helpers.js'
import { PartSql } from './part.sql.js'
import type { CreatePartitionedQueueMetaOptions, RunMaintenanceOptions, ShowPartitions, ShowPartitionsOptions } from './part.types.js'


export class Partition {

  constructor(
    protected readonly dbh: Knex,
    protected readonly queueMeta: QueueMetaManager,
  ) { }

  /**
   * @link https://tembo-io.github.io/pgmq/#partitioned-queues
   */
  async createPartitioned(options: CreatePartitionedQueueMetaOptions): Promise<string> {
    const opts: CreatePartitionedQueueMetaOptions = {
      ...options,
      trx: options.trx ?? await this.startTransaction(),
      queue: options.queue.toLowerCase(),
    }
    const { trx } = opts
    assert(trx, 'Transaction is required')

    await this._createPartitioned(opts)
    const queueId = await this.queueMeta.create(opts)

    if (! options.trx) {
      await trx.commit()
    }
    return queueId
  }


  // #region showPartitions()

  /**
   * show partitions of a partitioned table
   * @CAUTION queue must prefix with schema name, like 'public.my_queue'
   * @description will throw error if
   * - Given parent table not managed by pg_partman
   */
  async showPartitions(options: ShowPartitionsOptions): Promise<ShowPartitions[]> {
    const list = await this._showPartitions(options)
    return list
  }

  // #region run_maintenance()

  async runMaintenance(options?: RunMaintenanceOptions): Promise<void> {
    const name = options?.queue?.toLowerCase() ?? null
    const analyze = options?.analyze ?? false
    const jobmon = options?.jobmon ?? true

    const sql = name ? PartSql.runMaintenance2 : PartSql.runMaintenance
    const data = name ? [name, analyze, jobmon] : null
    await this.execute(sql, data, null)
  }



  private async _showPartitions(options: ShowPartitionsOptions): Promise<ShowPartitions[]> {
    const { trx } = options
    const name = options.queue.toLowerCase()
    const ord = options.order ?? 'ASC'
    const includeDefault = options.includeDefault ?? false

    const sql = PartSql.showPartitions
    const res = await this.execute<QueryResponse<ShowPartitionsRecord>>(sql, [name, ord, includeDefault], trx)

    const ret = res.rows.map(parseShowPartitionRecord)
    return ret
  }


  protected async _createPartitioned(options: CreatePartitionedQueueMetaOptions): Promise<void> {
    const { queue, partitionInterval, retentionInterval, trx } = options
    const sql = PartSql.createPartitioned
    const args = [
      queue,
      partitionInterval ?? '1 month',
      retentionInterval ?? '1 year',
    ]
    await this.execute(sql, args, trx)
  }


  // #region common ------------------------------

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

}

