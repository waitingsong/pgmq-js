
--
CREATE TABLE pgmq.tb_route (
  route_id int8 GENERATED ALWAYS AS IDENTITY NOT NULL,
  route_name varchar(512) NOT NULL,
  queue_ids int8[] NOT NULL,
  json jsonb,
  PRIMARY KEY (route_id),
  ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
  mtime TIMESTAMP(6)
);

CREATE UNIQUE INDEX route_route_name_uidx ON pgmq.tb_route (LOWER(route_name));
CREATE INDEX route_queue_ids_idx ON pgmq.tb_route (queue_ids);

