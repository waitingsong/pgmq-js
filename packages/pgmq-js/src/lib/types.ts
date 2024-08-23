import type { Knex } from 'knex'


export interface DbConfig extends Knex.Config {
  readonly client: DbClient
  connection: DbConnectionConfig
}

export type DbClient = 'pg' | 'pg-native'

// Config object for pg: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts
export interface DbConnectionConfig {
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