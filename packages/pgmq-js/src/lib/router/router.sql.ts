/**
 * tb_queue_meta table
 */
export enum RouteSql {
  count = 'SELECT COUNT(*) from pgmq.tb_route',
  getById = 'SELECT * from pgmq.tb_route WHERE route_id = ?',
  save = 'INSERT INTO pgmq.tb_route (route_name, queue_ids, json) VALUES (?,?,?) RETURNING route_id',
  update = 'UPDATE pgmq.tb_route SET route_name = ?, queue_ids = ?, json = ?, mtime = CURRENT_TIMESTAMP WHERE route_id = ?',
  deleteById = 'DELETE FROM pgmq.tb_route WHERE route_id = ?',
  truncate = 'TRUNCATE TABLE pgmq.tb_route',
}

