import type { Knex } from 'knex'


export interface DbConfig extends Knex.Config {
  readonly client: 'pg' | 'pg-native'
  connection: PgConnectionConfig
}

// Config object for pg: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts
interface PgConnectionConfig {
  host: string
  port: number
  user: string
  database: string
  password?: string | (() => string | Promise<string>)
  keepAlive?: boolean
  statement_timeout?: false | number
  parseInputDatesAsUTC?: boolean
  ssl?: boolean
  query_timeout?: number
  keepAliveInitialDelayMillis?: number
  idle_in_transaction_session_timeout?: number
  connectionTimeoutMillis?: number
}
