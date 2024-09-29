import assert from 'node:assert'

import { camelToSnake } from '@waiting/shared-core'

import { assertWithTrx } from '../helper.js'
import type { Knex, QueryResponse, Transaction } from '../knex.types.js'
import type { OptionsBase, QueueOptionsBase } from '../types.js'

import type { QueueMetaDo } from './db.types.js'
import { parseQueueMeta } from './queue-meta.helpers.js'
import { QueueMetaSql } from './queue-meta.sql.js'
import type {
  DeleteQueueMetaOptions,
  GetQueueMetaByIdOptions,
  ListQueueMetaOptions,
  QueueId,
  QueueMetaDto,
  CreateQueueMetaOptions,
  UpdateQueueMetaOptions,
} from './queue-meta.types.js'


export class QueueMetaManager {

  constructor(protected readonly dbh: Knex) { }


  async count(options: Omit<QueueOptionsBase, 'queue'> = {}): Promise<bigint> {
    const { trx } = options
    const sql = QueueMetaSql.count
    const res = await this.execute<QueryResponse<{ count: string }>>(sql, null, trx)
    const ret = res.rows[0]?.count ?? 0
    return BigInt(ret)
  }

  // #region getById

  async getById(options: GetQueueMetaByIdOptions): Promise<QueueMetaDto | undefined> {
    const { queueId, trx } = options
    const sql = QueueMetaSql.getById
    const res = await this.execute<QueryResponse<QueueMetaDo>>(sql, [queueId], trx)
    const ret = res.rows[0] ? parseQueueMeta(res.rows[0]) : undefined
    return ret
  }

  // #region getByName

  async getByName(options: QueueOptionsBase): Promise<QueueMetaDto | undefined> {
    const { queue: name, trx } = options
    const sql = QueueMetaSql.getByName
    const res = await this.execute<QueryResponse<QueueMetaDo>>(sql, [name.toLowerCase()], trx)
    const ret = res.rows[0] ? parseQueueMeta(res.rows[0]) : undefined
    return ret
  }

  async list(options?: ListQueueMetaOptions): Promise<QueueMetaDto[]> {
    const limit = options?.limit ?? 100
    const orderBy = options?.orderBy ?? 'queue_id'
    const order = options?.order ?? 'desc'
    const where = options?.relativeQueueId
      ? order === 'asc' ? `queue_id > ${options.relativeQueueId}` : `queue_id < ${options.relativeQueueId}`
      : null
    const trx = options?.trx

    const res = await this.execute2<QueueMetaDo[]>(trx, { limit, orderBy, order, where })
    const ret = res.map(parseQueueMeta)
    return ret
  }


  // #region save

  /**
   * Create a new queue
   * @param name - will be converted to lowercase,
   * Maximum 60 characters; alphanumeric characters, underscores (_) and hyphen (-) are allowed
   * @description * Throws error if queue already exists
   */
  async create(options: CreateQueueMetaOptions): Promise<QueueId> {
    const { queue, trx } = options
    const flag = await this.hasQueueMeta(options)
    await assertWithTrx(! flag, `Queue '${queue}' already exists in queue meta table`, trx)

    const sql = QueueMetaSql.save
    const { queueKey, json } = options
    const res = await this.execute<QueryResponse<{ queue_id: QueueId }>>(
      sql,
      [queue.toLowerCase(),
        queueKey ?? null,
        json ?? null,
      ],
      trx,
    )
    const ret = res.rows[0] ? res.rows[0].queue_id : null
    assert(ret, 'save queue failed')
    return ret
  }

  async hasQueueMeta(options: QueueOptionsBase): Promise<boolean> {
    const res = await this.getByName(options)
    return !! res
  }

  // #region delete

  async delete(options: DeleteQueueMetaOptions): Promise<void> {
    const queue = await this.getByName(options)
    await assertWithTrx(queue, `Queue '${options.queue}' not found`, options.trx)

    const sql = QueueMetaSql.deleteById
    const { trx } = options
    await this.execute(sql, [queue?.queueId], trx)
  }


  // #region update

  async update(options: UpdateQueueMetaOptions): Promise<void> {
    const queue = await this.getByName(options)
    await assertWithTrx(queue, `Queue '${options.queue}' not found`, options.trx)

    const sql = QueueMetaSql.update
    const { trx } = options
    const queueKey = options.queueKey ?? null
    const json = options.json ?? null
    await this.execute(sql, [queueKey, json, queue?.queueId], trx)
  }

  async truncate(options?: OptionsBase): Promise<void> {
    const sql = QueueMetaSql.truncate
    await this.execute(sql, null, options?.trx)
  }


  protected async execute<T = unknown>(sql: string, params: unknown[] | null, trx: Transaction | undefined | null): Promise<T> {
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

  protected async execute2<T = unknown>(
    trx: Transaction | undefined | null,
    extra?: ExtraQuery,
  ): Promise<T> {

    const dbh = trx ?? this.dbh
    try {
      const query = dbh('pgmq.tb_queue_meta').select('*')
      if (extra?.limit) {
        void query.limit(extra.limit)
      }
      if (extra?.orderBy) {
        void query.orderBy(camelToSnake(extra.orderBy), camelToSnake(extra.order ?? 'asc'))
      }
      if (extra?.where) {
        void query.whereRaw(extra.where)
      }

      const res = await query as T
      return res
    }
    catch (ex) {
      await trx?.rollback()
      throw ex
    }
  }
}


interface ExtraQuery {
  limit?: number
  where?: string | null
  orderBy?: string
  order?: 'asc' | 'desc'
}

