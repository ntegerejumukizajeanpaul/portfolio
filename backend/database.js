const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'portfolio.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    tagline TEXT,
    summary TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    linkedin TEXT,
    github TEXT,
    website TEXT,
    profile_image TEXT,
    is_published INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 50,
    category TEXT DEFAULT 'General',
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS experience (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    qr_code TEXT,
    verified_at DATETIME,
    verification_count INTEGER DEFAULT 0,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

module.exports = db;
