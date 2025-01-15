
--
CREATE TABLE tb_user (
  uid int8 GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_name varchar(60) NOT NULL,
  PRIMARY KEY (uid),
  ctime TIMESTAMP(6) NOT NULL DEFAULT now(),
  mtime TIMESTAMP(6)
);
CREATE INDEX idx_tb_user_user_name ON tb_user(ctime);

