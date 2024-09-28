/**
 * tb_queue_meta table
 */
export enum QueueMetaSql {
  count = 'SELECT COUNT(*) from pgmq.tb_queue_meta',
  getById = 'SELECT * from pgmq.tb_queue_meta WHERE queue_id = ?',
  getByName = 'SELECT * from pgmq.tb_queue_meta WHERE queue_name = ?',
  // getAll = 'SELECT * from pgmq.tb_queue_meta',
  save = 'INSERT INTO pgmq.tb_queue_meta (queue_name, queue_key, json) VALUES (?,?,?) RETURNING queue_id',
  update = 'UPDATE pgmq.tb_queue_meta SET queue_key = ?, json = ?, mtime = CURRENT_TIMESTAMP WHERE queue_id = ?',
  deleteById = 'DELETE FROM pgmq.tb_queue_meta WHERE queue_id = ?',
  truncate = 'TRUNCATE TABLE pgmq.tb_queue_meta',
}
