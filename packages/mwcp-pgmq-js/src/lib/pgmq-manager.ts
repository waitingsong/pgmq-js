import assert from 'node:assert'

import {
  App,
  ApplicationContext,
  DataSourceManager,
  IMidwayContainer,
  Init,
  Inject,
  Logger as _Logger,
  Singleton,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import { Application, MConfig } from '@mwcp/share'
import { Pgmq } from '@waiting/pgmq-js'

import { ConfigKey, PgmqSourceConfig, DbConfig } from './types.js'


@Singleton()
export class PgmqManager extends DataSourceManager<Pgmq> {

  @MConfig(ConfigKey.config) private readonly sourceConfig: PgmqSourceConfig

  @App() readonly app: Application
  @ApplicationContext() readonly applicationContext: IMidwayContainer

  @_Logger() private readonly logger: ILogger

  @Inject() baseDir: string

  getName(): string {
    return 'PgmqManager'
  }

  @Init()
  async init(): Promise<void> {
    await this.initDataSource(this.sourceConfig, '')
  }

  /**
   * 创建单个实例
   */
  protected async createDataSource(
    config: DbConfig,
    dataSourceName: string,
  ): Promise<Pgmq | undefined> {

    const dbConfig = this.getDbConfigByDbId(dataSourceName)
    assert(dbConfig, `createDataSource() failed: ${dataSourceName}`)
    const inst = new Pgmq(dataSourceName, dbConfig)
    assert(inst, `createDataSource() failed: ${dataSourceName}`)

    const connected = await this.checkConnected(inst)
    const conn: DbConfig['connection'] = { ...dbConfig.connection, password: '***' }
    assert(connected, `checkConnected() failed: ${dataSourceName}` + JSON.stringify(conn))

    // await inst.setTimeZone('Asia/Chongqing') // or 'UTC'

    this.setDbConfigByDbId(dataSourceName, config)
    return inst
  }

  async checkConnected(dataSource: Pgmq): Promise<boolean> {
    try {
      const time = await dataSource.getCurrentTime()
      return !! time
    }
    /* c8 ignore next 4 */
    catch (ex) {
      this.logger.error('[KmoreDbSourceManager]: checkConnected(). error ignored', ex)
      return false
    }
  }

  override async destroyDataSource(dataSource: Pgmq): Promise<void> {
    if (await this.checkConnected(dataSource)) {
      try {
        await dataSource.destroy()
      }
      /* c8 ignore next 4 */
      catch (ex: unknown) {
        this.logger.error(`Destroy knex connection failed with identifier: "${dataSource.dbId}" :
          \n${(ex as Error).message}`)
      }
    }
    this.dataSource.delete(dataSource.dbId)
  }

  protected getDbConfigByDbId(dbId: string): DbConfig | undefined {
    assert(dbId)
    const dbConfig = this.sourceConfig.dataSource[dbId]
    return dbConfig
  }

  protected setDbConfigByDbId(dbId: string, dbConfig: DbConfig): void {
    assert(dbId)
    assert(dbConfig)
    // if (! this.sourceConfig.dataSource) {
    //   this.sourceConfig.dataSource = {}
    // }
    this.sourceConfig.dataSource[dbId] = dbConfig
  }

}

