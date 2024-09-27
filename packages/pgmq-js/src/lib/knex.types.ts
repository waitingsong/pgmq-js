/* c8 ignore start */
import type { Knex } from 'knex'


export interface QueryResponse<T = unknown> {
  command: string // 'SELECT', 'DROP'
  fields: Record<string, string | number>[]
  oid?: unknown
  rowAsArray: boolean
  rowCount: number | null // 1
  rows: T[]
}

export type { Knex }
export type Transaction = Knex.Transaction

/* c8 ignore stop */
