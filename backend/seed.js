/**
 * Seeds a fresh database with one demo board, three columns, and a
 * handful of tasks. No-op if a board already exists, so it's safe
 * to call on every server start.
 */
function seed(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM boards').get();
  if (count > 0) return;

  const boardId = db
    .prepare('INSERT INTO boards (name) VALUES (?)')
    .run('TaskFlow Demo Board').lastInsertRowid;

  const columnDefs = [
    { name: 'To Do', position: 1 },
    { name: 'In Progress', position: 2 },
    { name: 'Done', position: 3 }
  ];

  const insertColumn = db.prepare(
    'INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)'
  );
  const columnIds = {};
  for (const col of columnDefs) {
    columnIds[col.name] = insertColumn.run(boardId, col.name, col.position).lastInsertRowid;
  }

  const taskDefs = [
    { column: 'To Do', title: 'Design database schema', description: 'Boards, columns, tasks with proper foreign keys', priority: 'High' },
    { column: 'To Do', title: 'Set up project structure', description: '', priority: 'Medium' },
    { column: 'In Progress', title: 'Build task board UI', description: 'Columns with add/edit/delete/move', priority: 'High' },
    { column: 'In Progress', title: 'Write backend tests', description: '', priority: 'Medium' },
    { column: 'Done', title: 'Initialize repository', description: 'Frontend + backend folders, README', priority: 'Low' }
  ];

  const insertTask = db.prepare(
    'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)'
  );
  for (const t of taskDefs) {
    insertTask.run(columnIds[t.column], t.title, t.description, t.priority);
  }
}

module.exports = { seed };