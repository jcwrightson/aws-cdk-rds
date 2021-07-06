CREATE TABLE IF NOT EXISTS todo (
  id varchar(255) NOT NULL PRIMARY KEY,
  task varchar(255) NOT NULL,
  complete boolean DEFAULT FALSE
)