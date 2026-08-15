import TaskCard from './TaskCard';

export default function Column({ column, allColumns, priorityFilter, onAddTask, onEditTask, onMoveTask, onDeleteTask }) {
  const visibleTasks = column.tasks.filter(
    (t) => priorityFilter === 'All' || t.priority === priorityFilter
  );

  return (
    <div className="column">
      <div className="column-header">
        <h2>{column.name}</h2>
        <span className="task-count">{column.tasks.length}</span>
      </div>

      <div className="task-list">
        {visibleTasks.length === 0 && <p className="empty-hint">No tasks</p>}
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            allColumns={allColumns}
            onEdit={() => onEditTask(task)}
            onMove={(columnId) => onMoveTask(task.id, columnId)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>

      <button className="add-task-btn" onClick={() => onAddTask(column.id)}>
        + Add task
      </button>
    </div>
  );
}