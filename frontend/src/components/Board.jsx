import Column from './Column';

export default function Board({ board, priorityFilter, onAddTask, onEditTask, onMoveTask, onDeleteTask }) {
  return (
    <div className="board">
      {board.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          allColumns={board.columns}
          priorityFilter={priorityFilter}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}