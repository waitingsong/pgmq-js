import type { RouterOption } from '@midwayjs/core'

import { initDbConfig, initMiddlewareOptions, initialMiddlewareConfig } from '##/lib/config.js'
import type { Config, MiddlewareConfig } from '##/lib/types.js'


export const pgmqConfig: Config = {
  enableDefaultRoute: false,
  enableApi: false,
  dataSource: {
    default: {
      ...initDbConfig,
    },
  },
  defaultDataSourceName: 'default',
}

export const pgmqMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [],
  options: {
    ...initMiddlewareOptions,
  },
}

export const swagger = {
  routerFilter: (url: string, options: RouterOption) => {
    void options
    if (url.startsWith('/_')) {
      return true
    }
  },
}

