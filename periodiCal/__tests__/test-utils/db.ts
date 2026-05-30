import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../db/schema'; // ⬅️ path to your schema.ts

export function createTestDatabase() {
  const sqlite = new Database(':memory:');

  // Essential: enable foreign key enforcement (disabled by default in SQLite)
  sqlite.pragma('foreign_keys = ON');
  // Optional: same journal mode as expo‑sqlite typically uses
  sqlite.pragma('journal_mode = WAL');

  applySchema(sqlite);

  return drizzle(sqlite, { schema });
}

/**
 * Creates all tables, columns and constraints according to the
 * Drizzle schema
 */
function applySchema(sqlite: Database.Database) {
  sqlite.exec(`

    -- 1. Users
    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      weight INTEGER
    );

    -- 2. Periods
    CREATE TABLE IF NOT EXISTS periods (
      periodId TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(userId),
      startDate TEXT NOT NULL,
      endDate TEXT
    );

    -- 3. Days (composite primary key)
    CREATE TABLE IF NOT EXISTS days (
      date TEXT NOT NULL,
      userId TEXT NOT NULL REFERENCES users(userId),
      isPeriodDay INTEGER DEFAULT 0,
      PRIMARY KEY (date, userId)
    );

    -- 4. PeriodDays
    CREATE TABLE IF NOT EXISTS period_days (
      periodId TEXT NOT NULL REFERENCES periods(periodId),
      date TEXT NOT NULL,
      userId TEXT NOT NULL,
      intensity INTEGER,
      PRIMARY KEY (periodId, date, userId),
      FOREIGN KEY (date, userId) REFERENCES days(date, userId)
    );

    -- 5. Symptoms
    CREATE TABLE IF NOT EXISTS symptoms (
      symptomId TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      userId TEXT NOT NULL,
      symptom TEXT NOT NULL,
      FOREIGN KEY (date, userId) REFERENCES days(date, userId)
    );

    -- 6. Notes
    CREATE TABLE IF NOT EXISTS notes (
      noteId TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      userId TEXT NOT NULL,
      note TEXT NOT NULL,
      FOREIGN KEY (date, userId) REFERENCES days(date, userId)
    );

  `);
}

export function cleanTestDatabase(db: ReturnType<typeof createTestDatabase>) {
  db.delete(schema.notes).run();
  db.delete(schema.symptoms).run();
  db.delete(schema.periodDays).run();
  db.delete(schema.days).run();
  db.delete(schema.periods).run();
  db.delete(schema.users).run();
}