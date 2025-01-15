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

  /**
   * Call this method **only once** for one pgmq instance
   * - Create extensions pgmq, pg_partman,
   * - Create meta tables
   */
  // async initEnvironment(): Promise<void> {
  //   // await this.dbh.raw('SET search_path TO pgmq, public;')
  //   await this.createExtension()
  //   await this.createExtension('pg_partman')

  //   const b1 = await this.tableExists(MetaTableNames.queueMeta) && await this.tableExists(MetaTableNames.route)
  //   if (! b1) {
  //     await this.createMetaTables()
  //   }
  // }

  /**
   * For auto maintenance of partitioned tables
   * Note: MUST call with database superuser connection!
   * @param name dbname(s) e.g. 'test' or  ['postgres', 'test'], if empty, reset to empty
   * @description Execute `ALTER SYSTEM SET pg_partman_bgw.dbname = '<name>,<name2>...';` and `SELECT pg_reload_conf();`
   * @link https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#run_maintenance
   */
  // async SetPgPartmanBgwDbname(names: string | string[]): Promise<void> {
  //   const arr = Array.isArray(names)
  //     ? names
  //     : names ? [names] : []
  //   const nameSet = arr.length ? new Set(arr) : new Set()
  //   const txt = nameSet.size ? Array.from(nameSet).join(',') : ''
  //   const sql = `ALTER SYSTEM SET pg_partman_bgw.dbname = '${txt}';`
  //   await this.dbh.raw(sql)
  //   const sql2 = 'SELECT pg_reload_conf();'
  //   await this.dbh.raw(sql2)
  // }


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

  /**
   * Create extension if not exists as the same user of other operations
   * @param extname default 'pgmq', can be 'pg_partman' for partitioning
   */
  // async createExtension(extname = 'pgmq'): Promise<void> {
  //   assert(extname, 'extname is required')
  //   if (extname === 'pgmq') {
  //     await this.dbh.raw(`CREATE EXTENSION IF NOT EXISTS ${extname};`)
  //   }
  //   else {
  //     await this.dbh.raw(`CREATE EXTENSION IF NOT EXISTS ${extname} WITH SCHEMA pgmq;`)
  //   }
  // }

  /**
   * Drop extension if exists as the same user of other operations
   * @param extname default 'pgmq', can be 'pg_partman' for partitioning
   */
  // async dropExtension(extname = 'pgmq'): Promise<void> {
  //   assert(extname, 'extname is required')
  //   await this.dbh.raw(`DROP EXTENSION IF EXISTS ${extname};`)
  //   if (extname === 'pgmq') {
  //     await this.dropMetaTables()
  //   }
  // }

//   protected async createMetaTables(): Promise<void> {
//     const sql1 = `CREATE TABLE IF NOT EXISTS pgmq.tb_queue_meta (
//   queue_id int8 GENERATED ALWAYS AS IDENTITY NOT NULL,
//   queue_name varchar(60) NOT NULL,
//   queue_key varchar(512),
//   json jsonb,
//   PRIMARY KEY (queue_id),
//   ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
//   mtime TIMESTAMP(6)
// ); `
//     await this.dbh.raw(sql1)

//     const sql2 = `CREATE TABLE IF NOT EXISTS pgmq.tb_route (
//   route_id int8 GENERATED ALWAYS AS IDENTITY NOT NULL,
//   route_name varchar(512) NOT NULL,
//   queue_ids int8[] NOT NULL,
//   json jsonb,
//   PRIMARY KEY (route_id),
//   ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
//   mtime TIMESTAMP(6)
// );

// CREATE UNIQUE INDEX route_route_name_uidx ON pgmq.tb_route (LOWER(route_name));
// CREATE INDEX route_queue_ids_idx ON pgmq.tb_route (queue_ids);
//     `
//     await this.dbh.raw(sql2)

//   }

  // async dropMetaTables(): Promise<void> {
  //   await this.dbh.raw('DROP TABLE IF EXISTS pgmq.tb_queue_meta;')
  //   await this.dbh.raw('DROP TABLE IF EXISTS pgmq.tb_route;')
  // }

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

