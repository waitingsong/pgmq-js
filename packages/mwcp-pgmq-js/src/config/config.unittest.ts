import { initDbConfig } from '##/lib/config.js'
import type { Config } from '##/lib/types.js'


export const keys = Date.now().toString()
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
//* c8 ignore next 4 */
if (pgmqConfig.dataSource['default']?.connection && ! pgmqConfig.dataSource['default'].connection.password) {
  // docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 quay.io/tembo/pgmq-pg:latest
  pgmqConfig.dataSource['default'].connection.password = 'password'
}

