
export enum QueueSql {
  create = 'SELECT pgmq.create(?)',
  list = 'SELECT pgmq.list_queues()',
  drop = 'SELECT pgmq.drop_queue(?)',
  detachArchive = 'SELECT pgmq.detach_archive(?)',
  createUnlogged = 'SELECT pgmq.create_unlogged(?)',
  /**
   * Permanently deletes all messages in a queue. Returns the number of messages that were deleted.
   * **NOT delete the queue itself**.
   */
  purge = 'SELECT pgmq.purge_queue(?)',
  getMetrics = 'SELECT * FROM pgmq.metrics(?)',
  getAllMetrics = 'SELECT * FROM pgmq.metrics_all()',

}
