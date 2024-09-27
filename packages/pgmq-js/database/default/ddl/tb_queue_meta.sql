
--
CREATE TABLE pgmq.tb_queue_meta (
  queue_id int8 GENERATED ALWAYS AS IDENTITY NOT NULL,
  queue_name varchar(60) NOT NULL,
  queue_key varchar(512),
  json jsonb,
  PRIMARY KEY (queue_id),
  ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
  mtime TIMESTAMP(6)
);

