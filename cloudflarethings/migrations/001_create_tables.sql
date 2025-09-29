-- 001_create_tables.sql
-- Create tables for DSE trends and dialogue storage

CREATE TABLE IF NOT EXISTS dse_trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dse_trends (date,value) VALUES ('2020-04-12',33);
CREATE TABLE IF NOT EXISTS dialogues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,
  message TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
