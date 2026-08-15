export default function TaskCard({ task, allColumns, onEdit, onMove, onDelete }) {
  return (
    <div className={`task-card priority-${task.priority.toLowerCase()}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        <span className="priority-badge">{task.priority}</span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-card-actions">
        <select value={task.column_id} onChange={(e) => onMove(Number(e.target.value))}>
          {allColumns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
}

