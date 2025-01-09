
export enum MsgSql {
  send = 'SELECT * FROM pgmq.send(?, ?, ?, ?::int4)',
  send2 = 'SELECT * FROM pgmq.send(?, ?, ?, ?::timestamp)',
  sendBatch = 'SELECT * FROM pgmq.send_batch(?, ?::jsonb[], ?::jsonb[], ?::int4)',
  sendBatch2 = 'SELECT * FROM pgmq.send_batch(?, ?::jsonb[], ?::jsonb[], ?::timestamp)',
  read = 'SELECT * FROM pgmq.read(?, ?, ?)',
  read2 = 'SELECT * FROM pgmq.read(?, ?, ?, ?)',
  pop = 'SELECT * FROM pgmq.pop(?)',
  delete = 'SELECT pgmq.delete(?, ?::bigint)',
  deleteBatch = 'SELECT pgmq.delete(?, ?::bigint[])',
  archive = 'SELECT pgmq.archive(?, ?::bigint)',
  archiveBatch = 'SELECT pgmq.archive(?, ?::bigint[])',
  setVt = 'SELECT * FROM pgmq.set_vt(?, ?, ?);',
  read_with_poll = 'SELECT * FROM pgmq.read_with_poll(?, ?, ?, ?, ?)',
}

