import assert from 'node:assert'

import type { BigIntStr, RecordSnakeKeys } from '@waiting/shared-types'
import type { Knex } from 'knex'

import type { QueryResponse } from '../knex.types.js'

import type { ArchiveBatchResp, ArchiveResp, DeleteBatchResp, DeleteResp, SendBatchResp, SendResp } from './db.types.js'
import { parseMessage } from './msg.helpers.js'
import { MsgSql } from './msg.sql.js'
import type { Message, MsgContent, MsgId } from './msg.types.js'


export class MsgManager {
  constructor(protected readonly dbh: Knex) { }

  // #region send

  /**
   * Send a message to the queue
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#send
   * @param delay Time in seconds before the message becomes visible. Defaults to 0.
   */
  async send<T extends MsgContent>(queue: string, msg: T, delay = 0): Promise<MsgId[]> {
    assert(typeof msg === 'object', 'msg must be object')
    const query = MsgSql.send
    const res = await this.dbh.raw(query, [queue, msg, delay]) as unknown as QueryResponse<SendResp>
    const [row] = res.rows
    assert(row, 'send failed')
    return [row.send]
  }

  /**
   * Send multiple messages to the queue
   * @param delay Time in seconds before the message becomes visible. Defaults to 0.
   */
  async sendBatch<T extends MsgContent>(queue: string, msgs: T[], delay = 0): Promise<MsgId[]> {
    const query = MsgSql.sendBatch
    const res = await this.dbh.raw(query, [queue, msgs, delay]) as unknown as QueryResponse<SendBatchResp>
    const ret = res.rows.map(row => row.send_batch)
    return ret
  }

  // #region read

  /**
   * @param vt Time in seconds that the message become invisible after reading, defaults to 1
   */
  async read<T extends MsgContent>(queue: string, vt = 1): Promise<Message<T> | null> {
    const rows = await this.readBatch<T>(queue, vt, 1)
    return rows[0] ?? null
  }

  /**
   * Same as read(). Also provides convenient long-poll functionality.
   * When there are no messages in the queue, the function
   * call will wait for max_poll_seconds in duration before returning.
   * If messages reach the queue during that duration, they will be read and returned immediately.
   *
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#read_with_poll
   * @note Ensure max_poll_seconds less than the timeout of the statement_timeout in the dbConfig (default 6000ms)
   * @param queue The name of the queue
   * @param vt    Time in seconds that the message become invisible after reading, defaults to 1
   * @param qty   The number of messages to read from the queue
   * @param max_poll_seconds Time in seconds to wait for new messages to reach the queue, defaults to 5(s)
   * @param poll_interval_ms Milliseconds between the internal poll operations, defaults to 100(ms)
   */
  async readWithPoll<T extends MsgContent>(
    queue: string,
    vt = 1,
    qty = 1,
    max_poll_seconds = 5,
    poll_interval_ms = 100,
  ): Promise<Message<T>[]> {

    const query = MsgSql.read_with_poll
    const res = await this.dbh.raw(
      query,
      [queue, vt, qty, max_poll_seconds, poll_interval_ms],
    ) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const ret = res.rows.map(parseMessage)
    return ret as Message<T>[]
  }

  /**
   * Read multiple messages from the queue
   * @param vt Time in seconds that the message become invisible after reading, defaults to 1
   * @param qty The number of messages to read from the queue, defaults to 1
   */
  async readBatch<T extends MsgContent = MsgContent>(queue: string, vt = 1, qty = 1): Promise<Message<T>[]> {
    const query = MsgSql.read
    const res = await this.dbh.raw(query, [queue, vt, qty]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const ret = res.rows.map(parseMessage)
    return ret as Message<T>[]
  }

  // #region pop

  async pop<T extends MsgContent = object>(queue: string): Promise<Message<T> | null> {
    const query = MsgSql.pop
    const res = await this.dbh.raw(query, [queue]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const rows = res.rows.map(parseMessage)
    const ret = rows[0]
    return ret as Message<T> | null
  }

  // #region delete

  async delete(queue: string, msgId: BigIntStr | number): Promise<MsgId[]> {
    const query = MsgSql.delete
    const res = await this.dbh.raw(query, [queue, msgId]) as unknown as QueryResponse<DeleteResp>
    const status = res.rows[0]?.delete
    const ret = status ? [msgId.toString()] : []
    return ret as MsgId[]
  }

  async deleteBatch(queue: string, msgIds: (BigIntStr | number)[]): Promise<MsgId[]> {
    const query = MsgSql.deleteBatch
    const res = await this.dbh.raw(query, [queue, msgIds]) as unknown as QueryResponse<DeleteBatchResp>
    const ret = res.rows.map(row => row.delete)
    return ret
  }

  // #region archive

  async archive(queue: string, msgId: BigIntStr | number): Promise<MsgId[]> {
    const query = MsgSql.archive
    const res = await this.dbh.raw(query, [queue, msgId]) as unknown as QueryResponse<ArchiveResp>
    const status = res.rows[0]?.archive
    const ret = status ? [msgId.toString()] : []
    return ret as MsgId[]
  }

  async archiveBatch(queue: string, msgIds: (BigIntStr | number)[]): Promise<MsgId[]> {
    const query = MsgSql.archiveBatch
    const res = await this.dbh.raw(query, [queue, msgIds]) as unknown as QueryResponse<ArchiveBatchResp>
    const ret = res.rows.map(row => row.archive)
    return ret
  }


  // #region setVt

  /**
   * @param vtOffset Duration from now, in seconds, that the message's VT should be set to
   */
  async setVt<T extends MsgContent>(queue: string, msgId: BigIntStr | number, vtOffset: number): Promise<Message<T> | null> {
    const query = MsgSql.setVt
    const res = await this.dbh.raw(query, [queue, msgId, vtOffset]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const rows = res.rows.map(parseMessage)
    const ret = rows[0] ?? null
    return ret as Message<T> | null
  }
}

