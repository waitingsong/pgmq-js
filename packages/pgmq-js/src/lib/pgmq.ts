import type { Knex } from 'knex'
import _knex from 'knex'

import { initDbConfigPart, initDbConnectionConfig } from './config.js'
import { type RespCommon, parseRespCommon } from './helper.js'
import type { Transaction } from './knex.types.js'
import { type MsgContent, type MsgId, type SendOptions, MsgManager } from './msg-manager/index.msg.js'
import { Partition } from './partition/index.part.js'
import { QueueManager } from './queue-manager/index.queue.js'
import { QueueMetaManager } from './queue-meta-manager/index.queue-meta.js'
import { type SendRouteMsgOptions, type SendRouteMsgResultItem, RouteMsg } from './route-msg/index.route-msg.js'
import { Router } from './router/index.router.js'
import type { DbConfig, DbConnectionConfig, QueueOptionsBase } from './types.js'


export class Pgmq {
  public readonly queue: QueueManager
  public readonly queueMeta: QueueMetaManager
  public readonly msg: MsgManager
  public readonly router: Router
  public readonly routeMsg: RouteMsg
  public readonly partition: Partition
  public readonly dbh: Knex
  protected readonly dbConfig: DbConfig

  constructor(
    public readonly dbId: string,
    dbConfig: Partial<DbConfig>,
  ) {
    this.dbConfig = processDbConfig(dbConfig)

    this.dbh = createDbh(this.dbConfig)
    this.queueMeta = new QueueMetaManager(this.dbh)
    this.partition = new Partition(this.dbh, this.queueMeta)
    this.queue = new QueueManager(this.dbh, this.queueMeta)
    this.msg = new MsgManager(this.dbh, this.queue)
    this.router = new Router(this.dbh, this.queueMeta)
    this.routeMsg = new RouteMsg(this.dbh, this.msg, this.queueMeta, this.router)
  }

  async getCurrentTime(): Promise<Date> {
    const res = await this.dbh.raw('SELECT CURRENT_TIMESTAMP AS currenttime;') as unknown
    const ret = parseRespCommon(res as RespCommon)
    return ret
  }

  /**
   *
   * @param delay '3s', '1 minute'
   * @returns
   */
  async getTimestamp(delay?: string): Promise<Date> {
    const intv = delay ? `+ INTERVAL '${delay}'` : ''
    const res = await this.dbh.raw(`SELECT CURRENT_TIMESTAMP ${intv} AS currenttime;`) as unknown
    const ret = parseRespCommon(res as RespCommon)
    return ret
  }

  /**
   *
   * @param zone available `SELECT pg_timezone_names()`
   */
  async setTimeZone(zone: string): Promise<string> {
    await this.dbh.raw(`SET TIME ZONE '${zone}'`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ret = await this.dbh.raw('SHOW TIME ZONE')
      .then((rows: { rows: unknown[] }) => {
        // @ts-expect-error TimeZone
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return rows.rows[0] ? rows.rows[0].TimeZone : 'N/A'
      })
    return ret as string
  }

  async startTransaction(): Promise<Transaction> {
    const ret = await this.dbh.transaction()
    return ret
  }

  async destroy(): Promise<void> {
    await this.dbh.destroy()
  }

  /**
   * Sync queue meta data from meta to tb_queue_meta
   */
  async syncQueueMeta(): Promise<void> {
    const trx = await this.startTransaction()

    const queues = await this.queue.list({ trx })
    for (const queue of queues) {
      const opts: QueueOptionsBase = { queue: queue.queue, trx }
      const flag = await this.queueMeta.hasQueueMeta(opts)
      if (flag) { continue }
      await this.queueMeta.create(opts)
    }

    await trx.commit()
  }

  /**
   * Send route message
   * @description Send a message to queues bind to the route
   */
  sendRouteMsg(options: SendRouteMsgOptions): Promise<SendRouteMsgResultItem[]> {
    return this.routeMsg.send(options)
  }

  /**
   * Send a message to the queue
   */
  sendMsg<T extends MsgContent>(options: SendOptions<T>): Promise<MsgId[]> {
    return this.msg.send(options)
  }

  async tableExists(tableName: string, schema = 'pgmq'): Promise<boolean> {
    const ret = await this.dbh.schema.withSchema(schema).hasTable(tableName)
    return ret
  }
}

export interface SendRouteMsg {

  trx?: Transaction | null
}

function createDbh(knexConfig: DbConfig): Knex {
  const inst = _knex(knexConfig)
  return inst
}

function processDbConfig(dbConfig: Partial<DbConfig>): DbConfig {
  const connection: DbConnectionConfig = {
    ...initDbConnectionConfig,
    ...dbConfig.connection,
  }

  const ret: DbConfig = {
    ...initDbConfigPart,
    ...dbConfig,
    connection,
  }
  return ret
}

