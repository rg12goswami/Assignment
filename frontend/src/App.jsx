import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import { getBoard, createTask, updateTask, moveTask, deleteTask } from './api';
import './App.css';

const BOARD_ID = 1;

export default function App() {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [editingTask, setEditingTask] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);

  async function loadBoard() {
    try {
      setLoading(true);
      const data = await getBoard(BOARD_ID);
      setBoard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  async function handleCreate(taskData) {
    try {
      await createTask({ ...taskData, column_id: addingToColumn });
      setAddingToColumn(null);
      await loadBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(taskData) {
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      await loadBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMove(taskId, columnId) {
    try {
      await moveTask(taskId, columnId);
      await loadBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      await loadBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="status-message">Loading board…</div>;
  if (error && !board) return <div className="status-message error">Failed to load board: {error}</div>;

  return (
    <div className="app">
      <header className="app-header">
        <h1>TaskFlow</h1>
        <div className="filter-bar">
          <label htmlFor="priority-filter">Filter by priority:</label>
          <select id="priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </header>

      {error && <div className="status-message error banner">{error}</div>}

      <Board
        board={board}
        priorityFilter={priorityFilter}
        onAddTask={setAddingToColumn}
        onEditTask={setEditingTask}
        onMoveTask={handleMove}
        onDeleteTask={handleDelete}
      />

      {(addingToColumn !== null || editingTask) && (
        <TaskModal
          task={editingTask}
          onSubmit={editingTask ? handleEdit : handleCreate}
          onClose={() => {
            setEditingTask(null);
            setAddingToColumn(null);
          }}
        />
      )}
    </div>
  );
}