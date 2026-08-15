const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * Opens (or creates) a SQLite database at dbPath and applies schema.sql.
 * Pass ':memory:' for an ephemeral in-memory DB (used in tests).
 */
function createDb(dbPath) {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  return db;
}

module.exports = { createDb };