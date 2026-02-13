CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  share_token TEXT UNIQUE DEFAULT (lower(hex(randomblob(16)))),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_sets INTEGER,
  default_reps TEXT,
  default_weight TEXT,
  note TEXT,
  image_url TEXT,
  sort_order INTEGER,
  is_timed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS session_exercises (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  completed BOOLEAN DEFAULT FALSE,
  sets_completed INTEGER,
  reps_completed TEXT,
  weight_used TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS health_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  swelling INTEGER CHECK(swelling BETWEEN 0 AND 10),
  pain INTEGER CHECK(pain BETWEEN 0 AND 10),
  stiffness INTEGER CHECK(stiffness BETWEEN 0 AND 10),
  rom_extension BOOLEAN,
  rom_flexion_degrees INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_health_log_user_date ON health_log(user_id, date);
