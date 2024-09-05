import type { Knex } from 'knex'
// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
import _knex from 'knex'

import { initDbConfigPart, initDbConnectionConfig } from './config.js'
import { type RespCommon, parseRespCommon } from './helper.js'
import { MsgManager } from './msg-manager/msg-manager.js'
import { QueueManager } from './queue-manager/queue-manager.js'
import type { DbConfig, DbConnectionConfig } from './types.js'


export class Pgmq {
  public readonly queue: QueueManager
  public readonly msg: MsgManager
  protected readonly dbh: Knex
  protected readonly dbConfig: DbConfig

  constructor(
    public readonly dbId: string,
    dbConfig: Partial<DbConfig>,
  ) {
    this.dbConfig = processDbConfig(dbConfig)

    this.dbh = createDbh(this.dbConfig)
    this.queue = new QueueManager(this.dbh)
    this.msg = new MsgManager(this.dbh)
  }

  async getCurrentTime(): Promise<Date> {
    const res = await this.dbh.raw('SELECT CURRENT_TIMESTAMP AS currenttime;') as unknown
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


  async destroy(): Promise<void> {
    await this.dbh.destroy()
  }

}


function createDbh(knexConfig: DbConfig): Knex {
  const inst = _knex.knex(knexConfig)
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

