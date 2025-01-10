
export enum PartSql {
  /**
   * @link https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#show_partitions
   */
  showPartitions = 'SELECT * FROM show_partitions(?::text, ?, ?)',
  /**
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned
   */
  createPartitioned = 'SELECT pgmq.create_partitioned(?, ?, ?)',
  runMaintenance = 'SELECT run_maintenance()',
  runMaintenance2 = 'SELECT run_maintenance(?::text, ?, ?)',
}
