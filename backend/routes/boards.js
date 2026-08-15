const express = require('express');

module.exports = function boardsRouter(db) {
  const router = express.Router();

  // GET /api/boards/:id — board with its columns and each column's tasks
  router.get('/:id', (req, res) => {
    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const columns = db
      .prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position')
      .all(board.id);

    const tasks = db
      .prepare(
        `SELECT * FROM tasks
         WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)
         ORDER BY created_at DESC`
      )
      .all(board.id);

    const columnsWithTasks = columns.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.column_id === col.id)
    }));

    res.json({ ...board, columns: columnsWithTasks });
  });

  // GET /api/boards/:id/stats — count of tasks per column.
  // This is one of the two "not a plain get-all" queries the assignment
  // requires: an aggregate GROUP BY with a LEFT JOIN so empty columns
  // still show a count of 0.
  router.get('/:id/stats', (req, res) => {
    const rows = db
      .prepare(
        `SELECT c.id AS column_id, c.name AS column_name, COUNT(t.id) AS task_count
         FROM columns c
         LEFT JOIN tasks t ON t.column_id = c.id
         WHERE c.board_id = ?
         GROUP BY c.id
         ORDER BY c.position`
      )
      .all(req.params.id);

    res.json(rows);
  });

  return router;
};