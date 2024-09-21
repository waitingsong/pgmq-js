import assert from 'node:assert'

import type { RecordSnakeKeys } from '@waiting/shared-types'
import type { Knex } from 'knex'

import type { QueryResponse, Transaction } from '../knex.types.js'

import type { ArchiveBatchResp, ArchiveResp, DeleteBatchResp, DeleteResp, SendBatchResp, SendResp } from './db.types.js'
import { parseMessage } from './msg.helpers.js'
import { MsgSql } from './msg.sql.js'
import type {
  DeleteBatchOptions, DeleteOptions,
  Message, MsgContent, MsgId,
  PopOptions,
  ReadBatchOptions, ReadOptions, ReadWithPollOptions,
  SendBatchOptions, SendOptions, SetVtOptions,
} from './msg.types.js'


export class MsgManager {
  constructor(protected readonly dbh: Knex) { }

  // #region send

  /**
   * Send a message to the queue
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#send
   */
  async send<T extends MsgContent>(options: SendOptions<T>): Promise<MsgId[]> {
    const { queue, msg, delay = 0, trx } = options

    assert(typeof msg === 'object', 'msg must be object')
    const query = MsgSql.send
    const res = await this.execute<QueryResponse<SendResp>>(query, [queue, msg, delay], trx)
    const [row] = res.rows
    assert(row, 'send failed')
    return [row.send]
  }

  /**
   * Send multiple messages to the queue
   * @param delay Time in seconds before the message becomes visible. Defaults to 0.
   */
  async sendBatch<T extends MsgContent>(options: SendBatchOptions<T>): Promise<MsgId[]> {
    const { queue, msgs, delay = 0, trx } = options

    const query = MsgSql.sendBatch
    const res = await this.execute<QueryResponse<SendBatchResp>>(query, [queue, msgs, delay], trx)
    const ret = res.rows.map(row => row.send_batch)
    return ret
  }

  // #region read

  /**
   * @param vt Time in seconds that the message become invisible after reading, defaults to 1
   */
  async read<T extends MsgContent>(options: ReadOptions): Promise<Message<T> | null> {
    const opts: ReadBatchOptions = { ...options, qty: 1 }
    const rows = await this.readBatch<T>(opts)
    return rows[0] ?? null
  }

  /**
   * Same as read(). Also provides convenient long-poll functionality.
   * When there are no messages in the queue, the function
   * call will wait for max_poll_seconds in duration before returning.
   * If messages reach the queue during that duration, they will be read and returned immediately.
   *
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#read_with_poll
   * @note Ensure max_poll_seconds less than the timeout of the statement_timeout in the dbConfig (default 5s)
   * @note do not support transaction
   */
  async readWithPoll<T extends MsgContent>(options: ReadWithPollOptions): Promise<Message<T>[]> {
    const { queue, vt = 1, qty = 1, maxPollSeconds = 5, pollIntervalMs = 100 } = options

    const query = MsgSql.read_with_poll
    const res = await this.execute<QueryResponse<RecordSnakeKeys<Message<T>>>>(
      query,
      [queue, vt, qty, maxPollSeconds, pollIntervalMs],
      void 0,
    )
    const ret = res.rows.map(parseMessage)
    return ret as Message<T>[]
  }

  /**
   * Read multiple messages from the queue
   */
  async readBatch<T extends MsgContent = MsgContent>(options: ReadBatchOptions): Promise<Message<T>[]> {
    const { queue, vt = 1, qty = 1, trx } = options

    const query = MsgSql.read
    const res = await this.execute<QueryResponse<RecordSnakeKeys<Message<T>>>>(query, [queue, vt, qty], trx)
    const ret = res.rows.map(parseMessage)
    return ret as Message<T>[]
  }

  // #region pop

  async pop<T extends MsgContent = object>(options: PopOptions): Promise<Message<T> | null> {
    const { queue, trx } = options

    const query = MsgSql.pop
    const res = await this.execute<QueryResponse<RecordSnakeKeys<Message<T>>>>(query, [queue], trx)
    const rows = res.rows.map(parseMessage)
    const ret = rows[0]
    return ret as Message<T> | null
  }

  // #region delete

  async delete(options: DeleteOptions): Promise<MsgId[]> {
    const { queue, msgId, trx } = options

    const query = MsgSql.delete
    const res = await this.execute<QueryResponse<DeleteResp>>(query, [queue, msgId], trx)
    const status = res.rows[0]?.delete
    const ret = status ? [msgId.toString()] : []
    return ret as MsgId[]
  }

  async deleteBatch(options: DeleteBatchOptions): Promise<MsgId[]> {
    const { queue, msgIds, trx } = options

    const query = MsgSql.deleteBatch
    const res = await this.execute<QueryResponse<DeleteBatchResp>>(query, [queue, msgIds], trx)
    const ret = res.rows.map(row => row.delete)
    return ret
  }

  // #region archive

  async archive(options: DeleteOptions): Promise<MsgId[]> {
    const { queue, msgId, trx } = options

    const query = MsgSql.archive
    const res = await this.execute<QueryResponse<ArchiveResp>>(query, [queue, msgId], trx)
    const status = res.rows[0]?.archive
    const ret = status ? [msgId.toString()] : []
    return ret as MsgId[]
  }

  async archiveBatch(options: DeleteBatchOptions): Promise<MsgId[]> {
    const { queue, msgIds, trx } = options

    const query = MsgSql.archiveBatch
    const res = await this.execute<QueryResponse<ArchiveBatchResp>>(query, [queue, msgIds], trx)
    const ret = res.rows.map(row => row.archive)
    return ret
  }


  // #region setVt

  /**
   * @param vt Duration from now, in seconds, that the message's VT should be set to
   */
  async setVt<T extends MsgContent>(options: SetVtOptions): Promise<Message<T> | null> {
    const { queue, msgId, vt: vtOffset, trx } = options

    const query = MsgSql.setVt
    const res = await this.execute<QueryResponse<RecordSnakeKeys<Message<T>>>>(query, [queue, msgId, vtOffset], trx)
    const rows = res.rows.map(parseMessage)
    const ret = rows[0] ?? null
    return ret as Message<T> | null
  }

  protected async execute<T = unknown>(sql: string, params: unknown[], trx: Transaction | undefined): Promise<T> {
    const dbh = trx ?? this.dbh
    const res = await dbh.raw(sql, params) as T
    return res
  }
}

