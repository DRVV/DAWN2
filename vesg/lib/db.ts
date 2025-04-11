import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve(process.cwd(), 'data', 'db', 'feedback.db'));

// Create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reviewer_id TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      feedback_text TEXT NOT NULL,
      feedback_result TEXT CHECK(feedback_result IN ('OK', 'NG')) NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
export default db;
