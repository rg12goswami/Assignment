const express = require('express');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

module.exports = function tasksRouter(db) {
  const router = express.Router();

  // POST /api/tasks — create a task. Title is required and validated
  // server-side (not just in the form), per the assignment.
  router.post('/', (req, res) => {
    const { column_id, title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!column_id) {
      return res.status(400).json({ error: 'column_id is required' });
    }

    const columnExists = db.prepare('SELECT id FROM columns WHERE id = ?').get(column_id);
    if (!columnExists) {
      return res.status(400).json({ error: 'Invalid column_id' });
    }

    const finalPriority = VALID_PRIORITIES.includes(priority) ? priority : 'Medium';

    const result = db
      .prepare('INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)')
      .run(column_id, title.trim(), description || null, finalPriority);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  });

  // PUT /api/tasks/:id — edit title / description / priority
  router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, priority } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const updated = {
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description : existing.description,
      priority: VALID_PRIORITIES.includes(priority) ? priority : existing.priority
    };

    db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?').run(
      updated.title,
      updated.description,
      updated.priority,
      req.params.id
    );

    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  });

  // PUT /api/tasks/:id/move — move a task to a different column
  router.put('/:id/move', (req, res) => {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { column_id } = req.body;
    const columnExists = db.prepare('SELECT id FROM columns WHERE id = ?').get(column_id);
    if (!columnExists) {
      return res.status(400).json({ error: 'Invalid column_id' });
    }

    db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?').run(column_id, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  });

  // DELETE /api/tasks/:id
  router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.status(204).send();
  });

  // GET /api/tasks/priority/:priority — tasks with a given priority, newest
  // first. This is the second required "real" query: WHERE + ORDER BY done
  // in SQL, not filtered client-side after fetching everything.
  router.get('/priority/:priority', (req, res) => {
    const { priority } = req.params;
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const tasks = db
      .prepare('SELECT * FROM tasks WHERE priority = ? ORDER BY created_at DESC')
      .all(priority);

    res.json(tasks);
  });

  return router;
};