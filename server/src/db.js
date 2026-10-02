import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "family.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// light migration helper: add a column only if missing
function addColumn(table, name, def) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
  }
}

// ---- schema (v1: scaffold; extended per phase) ----
db.exec(`
CREATE TABLE IF NOT EXISTS parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(parent_id, nickname)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('parent', 'child')),
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES children(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  coins INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready','working','done','approved','paused')),
  kid_note TEXT NOT NULL DEFAULT '',
  deleted INTEGER NOT NULL DEFAULT 0,
  paused_from TEXT NOT NULL DEFAULT '',
  completed_by INTEGER REFERENCES children(id) ON DELETE SET NULL,
  deadline TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS task_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('parent','child')),
  actor_id INTEGER NOT NULL,
  event TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS task_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS child_worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL CHECK (world_id IN ('pirates','space','dollhouse')),
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  character_name TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 0,
  free_chests INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, world_id)
);
CREATE TABLE IF NOT EXISTS potion_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 10,
  in_chest INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chest_prices (
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  price INTEGER NOT NULL,
  PRIMARY KEY (parent_id, world_id, level)
);

CREATE TABLE IF NOT EXISTS kid_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  potion_template_id INTEGER REFERENCES potion_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT '',
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS module_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  module_key TEXT NOT NULL CHECK (module_key IN ('coins_10','deadline_1day','bedtime_30','exp_10','chest_discount_20')),
  name TEXT NOT NULL,
  bonus_text TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 100,
  UNIQUE(parent_id, world_id, module_key)
);

CREATE TABLE IF NOT EXISTS purchased_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  module_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, world_id, module_key)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL DEFAULT '{}',
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','declined')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// migrations for existing databases
addColumn("parents", "language", "TEXT NOT NULL DEFAULT 'uk'");
addColumn("children", "language", "TEXT NOT NULL DEFAULT 'uk'");
addColumn("parents", "plan", "TEXT NOT NULL DEFAULT 'free'");
addColumn("tasks", "category", "TEXT NOT NULL DEFAULT 'other'");
addColumn("tasks", "difficulty", "INTEGER NOT NULL DEFAULT 1");
addColumn("potion_templates", "archived", "INTEGER NOT NULL DEFAULT 0");
// canonical trilingual standard programs (phase 9)
addColumn("potion_templates", "name_uk", "TEXT NOT NULL DEFAULT ''");
addColumn("potion_templates", "name_es", "TEXT NOT NULL DEFAULT ''");
addColumn("potion_templates", "effect_uk", "TEXT NOT NULL DEFAULT ''");
addColumn("potion_templates", "effect_es", "TEXT NOT NULL DEFAULT ''");
addColumn("module_templates", "name_uk", "TEXT NOT NULL DEFAULT ''");
addColumn("module_templates", "name_es", "TEXT NOT NULL DEFAULT ''");
addColumn("module_templates", "bonus_uk", "TEXT NOT NULL DEFAULT ''");
addColumn("module_templates", "bonus_es", "TEXT NOT NULL DEFAULT ''");
// themes (phase 10)
addColumn("parents", "theme", "TEXT NOT NULL DEFAULT 'bright'");
addColumn("children", "theme", "TEXT NOT NULL DEFAULT 'sky'");

export function getDb() {
  return db;
}
