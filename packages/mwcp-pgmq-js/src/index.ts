import type { Config, ConfigKey, MiddlewareConfig } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.app.js'
export * from './interface.js'
export * from './lib/index.js'

export { QueueApi } from './app/index.app.js'

export * from './app/queue/queue.dto.js'
export * from './app/msg/msg.dto.js'

export type {
  DbConnectionConfig,
  Message,
  MsgId,
  MsgContent,
  Queue,
  QueueMetrics,
} from '@waiting/pgmq-js'
export {
  Pgmq, genRandomName,
} from '@waiting/pgmq-js'

declare module '@midwayjs/core/dist/interface.js' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
    [ConfigKey.middlewareConfig]: Partial<MiddlewareConfig>
  }
}

