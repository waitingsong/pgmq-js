/* c8 ignore start */

export interface QueryResponse<T = unknown> {
  command: string // 'SELECT', 'DROP'
  fields: Record<string, string | number>[]
  oid?: unknown
  rowAsArray: boolean
  rowCount: number | null // 1
  rows: T[]
}

/* c8 ignore stop */
