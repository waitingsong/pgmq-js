import type { ShowPartitionsRecord } from './db.types.js'
import type { ShowPartitions } from './part.types.js'


export function parseShowPartitionRecord(input: ShowPartitionsRecord): ShowPartitions {
  const ret: ShowPartitions = {
    partitionSchemaname: input.partition_schemaname,
    partitionTablename: input.partition_tablename,
  }
  return ret
}

