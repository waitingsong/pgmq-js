
export enum MsgSql {
  send = 'SELECT * FROM pgmq.send(?, ?, ?)',
  sendBatch = 'SELECT * FROM pgmq.send_batch(?, ?::jsonb[], ?)',
  read = 'SELECT * FROM pgmq.read(?, ?, ?)',
  pop = 'SELECT * FROM pgmq.pop(?)',
  delete = 'SELECT pgmq.delete(?, ?::bigint)',
  deleteBatch = 'SELECT pgmq.delete(?, ?::bigint[])',
  archive = 'SELECT pgmq.archive(?, ?::bigint)',
  archiveBatch = 'SELECT pgmq.archive(?, ?::bigint[])',
  setVt = 'SELECT * FROM pgmq.set_vt(?, ?, ?);',
}

