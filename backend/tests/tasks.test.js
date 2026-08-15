const test = require('node:test');
const assert = require('node:assert');
const { createDb } = require('../db');
const { seed } = require('../seed');
const { createApp } = require('../app');

// Fresh in-memory DB + seeded data + a real Express app for each test,
// so tests never touch the real taskflow.db file and never leak state
// into each other.
function setup() {
  const db = createDb(':memory:');
  seed(db);
  const app = createApp(db);
  return { db, app };
}

test('creating a task with no title fails', async () => {
  const { app } = setup();
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column_id: 1, title: '   ' })
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.ok(body.error);

  server.close();
});

test('moving a task updates its column_id', async () => {
  const { app, db } = setup();
  const server = app.listen(0);
  const port = server.address().port;

  const columns = db.prepare('SELECT * FROM columns ORDER BY position').all();
  const task = db.prepare('SELECT * FROM tasks LIMIT 1').get();
  const targetColumn = columns.find((c) => c.id !== task.column_id);

  const res = await fetch(`http://localhost:${port}/api/tasks/${task.id}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column_id: targetColumn.id })
  });

  assert.strictEqual(res.status, 200);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
  assert.strictEqual(updated.column_id, targetColumn.id);

  server.close();
});

test('tasks-per-column query returns correct counts for known seed data', () => {
  const { db } = setup();

  const toDo = db.prepare("SELECT * FROM columns WHERE name = 'To Do'").get();

  const stats = db
    .prepare(
      `SELECT c.id AS column_id, COUNT(t.id) AS task_count
       FROM columns c
       LEFT JOIN tasks t ON t.column_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`
    )
    .get(toDo.id);

  // seed.js puts exactly 2 tasks in "To Do"
  assert.strictEqual(stats.task_count, 2);
});