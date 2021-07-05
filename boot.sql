CREATE TABLE IF NOT EXISTS todo (
  ID varchar(255) NOT NULL PRIMARY KEY,
  Task varchar(255) NOT NULL,
  Complete boolean DEFAULT FALSE
)