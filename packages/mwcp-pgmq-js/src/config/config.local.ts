import { initDbConfig } from '##/lib/config.js'
import type { Config } from '##/lib/types.js'


export const keys = 123456
export const koa = {
  port: 7001,
}

export const pgmqConfig: Config = {
  enableDefaultRoute: true,
  enableApi: true,
  dataSource: {
    default: {
      ...initDbConfig,
    },
  },
  defaultDataSourceName: 'default',
}

