
export enum MsgSql {
  send = 'SELECT * FROM pgmq.send(?, ?, ?::int4)',
  sendBatch = 'SELECT * FROM pgmq.send_batch(?, ?::jsonb[], ?::int4)',
  read = 'SELECT * FROM pgmq.read(?, ?, ?)',
  pop = 'SELECT * FROM pgmq.pop(?)',
  delete = 'SELECT pgmq.delete(?, ?::bigint)',
  deleteBatch = 'SELECT pgmq.delete(?, ?::bigint[])',
  archive = 'SELECT pgmq.archive(?, ?::bigint)',
  archiveBatch = 'SELECT pgmq.archive(?, ?::bigint[])',
  setVt = 'SELECT * FROM pgmq.set_vt(?, ?, ?);',
  read_with_poll = 'SELECT * FROM pgmq.read_with_poll(?, ?, ?, ?, ?)',
}

