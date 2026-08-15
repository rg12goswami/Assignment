import { useState } from 'react';

export default function TaskModal({ task, onSubmit, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [formError, setFormError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), priority });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{task ? 'Edit Task' : 'New Task'}</h2>

        {formError && <p className="form-error">{formError}</p>}

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            {task ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}