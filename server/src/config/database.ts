import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './database/challenges.db';
const dbDir = path.dirname(dbPath);

// Создаём папку для БД если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Подключение к БД
export const db = new Database(dbPath, { verbose: console.log });

// Включаем foreign keys
db.pragma('foreign_keys = ON');

// Инициализация таблиц
export const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Challenges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('one-time', 'recurring')) NOT NULL,
      frequency TEXT,
      duration_days INTEGER,
      target_value REAL,
      metric_unit TEXT,
      stake_description TEXT,
      creator_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_date DATE,
      status TEXT CHECK(status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Challenge Participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      accepted_at DATETIME,
      role TEXT CHECK(role IN ('creator', 'participant')) NOT NULL,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(challenge_id, user_id)
    )
  `);

  // Progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN DEFAULT 0,
      value REAL,
      note TEXT,
      proof_url TEXT,
      completed_at DATETIME,
      FOREIGN KEY (participant_id) REFERENCES challenge_participants(id) ON DELETE CASCADE,
      UNIQUE(participant_id, date)
    )
  `);

  // Progress Comments table
db.exec(`
  CREATE TABLE IF NOT EXISTS progress_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    progress_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Notifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('challenge_invite', 'challenge_accepted', 'progress_marked', 'comment_added')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    challenge_id INTEGER,
    progress_id INTEGER,
    from_user_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

  console.log('✅ Database initialized');
};