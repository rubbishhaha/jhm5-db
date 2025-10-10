DROP TABLE IF EXISTS sheet1;
CREATE TABLE sheet1 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

DROP TABLE IF EXISTS sheet2;
CREATE TABLE sheet2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

DROP TABLE IF EXISTS sheet3;
CREATE TABLE sheet3 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  all_male INTEGER,
  all_female INTEGER,
  all_total INTEGER
);

-- dialogues table: store imported README and prompts
DROP TABLE IF EXISTS dialogues;
CREATE TABLE dialogues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,
  message TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
