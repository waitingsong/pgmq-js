import type { Knex } from 'knex'

import type { QueryResponse } from '../knex.types.js'

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

  async create(name: string): Promise<void> {
    const query = QueueSql.create
    await this.dbh.raw(query, [name])
  }

  public async createUnlogged(name: string) {
    const query = QueueSql.createUnlogged
    await this.dbh.raw(query, [name])
  }

  async hasQueue(name: string): Promise<boolean> {
    const list = await this.list()
    for (const queue of list) {
      if (queue.name === name) {
        return true
      }
    }
    return false
  }

  // #region getOne

  async getOne(name: string): Promise<Queue | null> {
    const list = await this.list()
    for (const queue of list) {
      if (queue.name === name) {
        return queue
      }
    }
    return null
  }

  // #region list

  async list(): Promise<Queue[]> {
    const query = QueueSql.list
    const res = await this.dbh.raw(query) as unknown as QueryResponse<ListResp>

    const ret = res.rows.map((row) => {
      const line = row['list_queues']
      return parseDbQueue(line)
    })
    return ret
  }

  // #region drop

  /**
   * Return false if queue does not exist
   */
  async drop(name: string): Promise<boolean> {
    const query = QueueSql.drop
    try {
      const res = await this.dbh.raw(query, [name]) as unknown as QueryResponse<DropResp>
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
  async purge(name: string): Promise<string> {
    const query = QueueSql.purge
    try {
      const res = await this.dbh.raw(query, [name]) as unknown as QueryResponse<PurgeResp>
      const [row] = res.rows
      const ret = row?.purge_queue ?? '0'
      return ret
    }
    catch (ex) {
      return '0'
    }
  }

  // #region  detachArchive

  /**
   * Return false if queue does not exist
   */
  async detachArchive(name: string): Promise<boolean> {
    const query = QueueSql.detachArchive
    try {
      await this.dbh.raw(query, [name]) as unknown as QueryResponse<DetachArchiveResp>
      return true
    }
    catch (ex) {
      console.warn(ex)
      return false
    }
  }

  // #region getMetrics

  async getMetrics(name: string): Promise<QueueMetrics | null> {
    const query = QueueSql.getMetrics
    try {
      const res = await this.dbh.raw(query, [name]) as unknown as QueryResponse<MetricsResp>
      const data = res.rows[0]
      const ret = data ? parseQueueMetrics(data) : null
      return ret
    }

    catch (ex) {
      console.warn(ex)
      return null
    }
  }

  // #region getAllMetrics

  async getAllMetrics(): Promise<QueueMetrics[]> {
    const query = QueueSql.getAllMetrics
    const res = await this.dbh.raw(query) as unknown as QueryResponse<MetricsResp>
    const ret = res.rows.map(parseQueueMetrics)
    return ret
  }

}
