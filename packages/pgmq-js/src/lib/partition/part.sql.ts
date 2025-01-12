
export enum PartSql {
  /**
   * @link https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md#show_partitions
   */
  showPartitions = 'SELECT * FROM pgmq.show_partitions(?::text, ?, ?)',
  /**
   * @link https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned
   */
  createPartitioned = 'SELECT pgmq.create_partitioned(?, ?, ?)',
  runMaintenance = 'SELECT pgmq.run_maintenance()',
  runMaintenance2 = 'SELECT pgmq.run_maintenance(?::text, ?, ?)',
}
