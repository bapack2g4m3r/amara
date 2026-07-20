import { useState } from 'react';
import { Plus, Check, Search, Trash2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Activities.css';

const MOCK_CATEGORIES = [
  { id: 'Wedding Organizer', name: 'Wedding Organizer' },
  { id: 'Venue', name: 'Venue' },
  { id: 'Catering', name: 'Catering' },
  { id: 'Photography', name: 'Photography' },
  { id: 'MUA', name: 'MUA' },
  { id: 'Decor & Styling', name: 'Decor & Styling' },
  { id: 'Attire', name: 'Attire' },
  { id: 'Entertainment', name: 'Entertainment' }
];

const Activities = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useWeddingStore();
  const [activeCategory, setActiveCategory] = useState('Wedding Organizer');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Get tasks for the current category
  const categoryTasks = tasks.filter(t => t.category === activeCategory);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      title: newTaskTitle,
      category: activeCategory,
      is_completed: false
    });
    
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="activities-container">
      <header className="page-header">
        <h1>Our Wedding To-Do List</h1>
        <p className="subtitle">Build your perfect wedding plan</p>
      </header>

      <div className="activities-grid">
        {/* Step 1: Categories */}
        <div className="card categories-card">
          <div className="card-header">
            <div>
              <h3>Step 1</h3>
              <p>Choose What Applies to You</p>
            </div>
            <Search className="icon-muted" size={20} />
          </div>
          
          <ul className="category-list">
            {MOCK_CATEGORIES.map(category => (
              <li 
                key={category.id} 
                className={`category-item ${activeCategory === category.id ? 'selected' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className={`checkbox ${activeCategory === category.id ? 'checked' : ''}`}>
                  {activeCategory === category.id && <Check size={14} color="white" />}
                </div>
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step 2: Tasks */}
        <div className="card tasks-card">
          <div className="card-header">
            <div>
              <h3>Step 2</h3>
              <p>Customize Your Workflow</p>
            </div>
          </div>
          
          <div className="active-category-header">
            <h4>{activeCategory}</h4>
          </div>

          <ul className="task-list-details">
            {categoryTasks.map(task => (
              <li key={task.id} className="task-item-detail" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    className={`checkbox ${task.is_completed ? 'checked' : ''}`}
                    onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                    style={{ cursor: 'pointer' }}
                  >
                    {task.is_completed && <Check size={14} color="white" />}
                  </div>
                  <span style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? 'var(--color-text-muted)' : 'inherit' }}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {categoryTasks.length === 0 && !isAdding && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No tasks for this category yet.</p>
            )}
          </ul>
          
          {isAdding ? (
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Save</button>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '8px', color: 'var(--color-text-muted)' }}>Cancel</button>
            </form>
          ) : (
            <button className="btn-add" onClick={() => setIsAdding(true)} style={{ marginTop: '15px' }}>
              <Plus size={16} /> Add New Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
