import assert from 'node:assert'

import type { BigIntStr, RecordSnakeKeys } from '@waiting/shared-types'
import type { Knex } from 'knex'

import type { QueryResponse } from '../knex.types.js'

import type { ArchiveBatchResp, ArchiveResp, DeleteBatchResp, DeleteResp, SendBatchResp, SendResp } from './db.types.js'
import { parseMessage } from './msg.helpers.js'
import { MsgSql } from './msg.sql.js'
import type { Message, MsgId } from './msg.types.js'


export class MsgManager {
  constructor(protected readonly dbh: Knex) { }

  // #region send

  async send<T extends object = object>(queue: string, msg: T, delay = 0): Promise<MsgId> {
    assert(typeof msg === 'object', 'msg must be object')
    const query = MsgSql.send
    const res = await this.dbh.raw(query, [queue, msg, delay]) as unknown as QueryResponse<SendResp>
    const [row] = res.rows
    assert(row, 'send failed')
    return row.send
  }

  async sendBatch<T extends object>(queue: string, msgs: T[], delay = 0): Promise<MsgId[]> {
    const query = MsgSql.sendBatch
    const res = await this.dbh.raw(query, [queue, msgs, delay]) as unknown as QueryResponse<SendBatchResp>
    const ret = res.rows.map(row => row.send_batch)
    return ret
  }

  // #region read

  /**
   * @param vt Time in seconds that the message become invisible after reading
   */
  async read<T extends object = object>(queue: string, vt = 0): Promise<Message<T> | null> {
    const rows = await this.readBatch<T>(queue, vt, 1)
    return rows[0] ?? null
  }

  /**
   * @param vt Time in seconds that the message become invisible after reading
   */
  async readBatch<T extends object = object>(queue: string, vt: number, numMessages: number): Promise<Message<T>[]> {
    const query = MsgSql.read
    const res = await this.dbh.raw(query, [queue, vt, numMessages]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const ret = res.rows.map(parseMessage)
    return ret as Message<T>[]
  }

  // #region pop

  async pop<T extends object = object>(queue: string): Promise<Message<T> | null> {
    const query = MsgSql.pop
    const res = await this.dbh.raw(query, [queue]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const rows = res.rows.map(parseMessage)
    const ret = rows[0]
    return ret as Message<T> | null
  }

  // #region delete

  async delete(queue: string, msgId: BigIntStr | number): Promise<boolean> {
    const query = MsgSql.delete
    const res = await this.dbh.raw(query, [queue, msgId]) as unknown as QueryResponse<DeleteResp>
    const ret = res.rows[0]?.delete
    return !! ret
  }

  async deleteBatch(queue: string, msgIds: (BigIntStr | number)[]): Promise<MsgId[]> {
    const query = MsgSql.deleteBatch
    const res = await this.dbh.raw(query, [queue, msgIds]) as unknown as QueryResponse<DeleteBatchResp>
    const ret = res.rows.map(row => row.delete)
    return ret
  }

  // #region archive

  async archive(queue: string, msgId: BigIntStr | number): Promise<boolean> {
    const query = MsgSql.archive
    const res = await this.dbh.raw(query, [queue, msgId]) as unknown as QueryResponse<ArchiveResp>
    const ret = res.rows[0]?.archive
    return !! ret
  }

  async archiveBatch(queue: string, msgIds: (BigIntStr | number)[]): Promise<MsgId[]> {
    const query = MsgSql.archiveBatch
    const res = await this.dbh.raw(query, [queue, msgIds]) as unknown as QueryResponse<ArchiveBatchResp>
    const ret = res.rows.map(row => row.archive)
    return ret
  }


  // #region setVt

  /**
   *
   * @param vtOffset Duration from now, in seconds, that the message's VT should be set to
   */
  async setVt<T extends object = object>(queue: string, msgId: BigIntStr | number, vtOffset: number): Promise<Message<T> | null> {
    const query = MsgSql.setVt
    const res = await this.dbh.raw(query, [queue, msgId, vtOffset]) as unknown as QueryResponse<RecordSnakeKeys<Message<T>>>
    const rows = res.rows.map(parseMessage)
    const ret = rows[0]
    return ret as Message<T> | null
  }
}

