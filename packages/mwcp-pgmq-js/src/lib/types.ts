// import type { DataSourceManagerConfigOption } from '@midwayjs/core'
import type { BaseConfig } from '@mwcp/share'
import type { DbConfig } from '@waiting/pgmq-js'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'


export type { DbConnectionConfig } from '@waiting/pgmq-js'
export type { DbConfig }

export enum ConfigKey {
  config = 'pgmqConfig',
  middlewareConfig = 'pgmqMiddlewareConfig',
  namespace = 'pgmq',
  componentName = 'pgmqComponent',
  middlewareName = 'pgmqMiddleware',
}

export enum Msg {
  hello = 'hello world',
}

export interface Config extends BaseConfig, PgmqSourceConfig {
  /**
   * Enable mq http route, eg. /pgmq/queue/create
   */
  enableApi?: boolean | undefined
}

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>


/** midway DataSource */
export interface PgmqSourceConfig {
  defaultDataSourceName?: string
  dataSource: Record<string, DbConfig>
  /**
   * @default false
   */
  validateConnection?: boolean
  /**
   * @default true
   */
  cacheInstance?: boolean | undefined
}

