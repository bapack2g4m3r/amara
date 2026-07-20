import { useState } from 'react';
import { Plus, Check, Search, Trash2, Calendar, AlertCircle, Wand2 } from 'lucide-react';
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
  const { tasks, addTask, updateTaskStatus, deleteTask, generateTemplateTasks } = useWeddingStore();
  const [activeCategory, setActiveCategory] = useState('Wedding Organizer');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    priority: 'Medium',
    due_date: ''
  });

  // Get tasks for the current category
  const categoryTasks = tasks.filter(t => t.category === activeCategory)
                             .sort((a, b) => new Date(a.due_date || '2099-01-01') - new Date(b.due_date || '2099-01-01'));

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    
    await addTask({
      title: newTaskForm.title,
      category: activeCategory,
      priority: newTaskForm.priority,
      due_date: newTaskForm.due_date || null,
      is_completed: false
    });
    
    setNewTaskForm({ title: '', priority: 'Medium', due_date: '' });
    setIsAdding(false);
  };

  const handleGenerateTemplates = async () => {
    setIsGenerating(true);
    await generateTemplateTasks(activeCategory);
    setIsGenerating(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'var(--color-danger)';
      case 'Medium': return 'var(--color-warning)';
      case 'Low': return 'var(--color-success)';
      default: return 'var(--color-text-muted)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            {MOCK_CATEGORIES.map(category => {
              const taskCount = tasks.filter(t => t.category === category.id).length;
              return (
                <li 
                  key={category.id} 
                  className={`category-item ${activeCategory === category.id ? 'selected' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={`checkbox ${activeCategory === category.id ? 'checked' : ''}`}>
                      {activeCategory === category.id && <Check size={14} color="white" />}
                    </div>
                    <span>{category.name}</span>
                  </div>
                  {taskCount > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '12px' }}>{taskCount}</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Step 2: Tasks */}
        <div className="card tasks-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3>Step 2</h3>
              <p>Customize Your Workflow</p>
            </div>
            {categoryTasks.length === 0 && (
              <button className="btn-primary-outline" onClick={handleGenerateTemplates} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '0.9rem' }}>
                <Wand2 size={16} /> {isGenerating ? 'Generating...' : 'Magic Template'}
              </button>
            )}
          </div>
          
          <div className="active-category-header">
            <h4>{activeCategory}</h4>
          </div>

          <ul className="task-list-details">
            {categoryTasks.map(task => (
              <li key={task.id} className="task-item-detail" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flex: 1 }}>
                  <div 
                    className={`checkbox ${task.is_completed ? 'checked' : ''}`}
                    onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                    style={{ cursor: 'pointer', marginTop: '3px' }}
                  >
                    {task.is_completed && <Check size={14} color="white" />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ 
                      textDecoration: task.is_completed ? 'line-through' : 'none', 
                      color: task.is_completed ? 'var(--color-text-muted)' : 'inherit',
                      fontWeight: 500
                    }}>
                      {task.title}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                      {task.priority && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getPriorityColor(task.priority) }}>
                          <AlertCircle size={12} /> {task.priority}
                        </span>
                      )}
                      {task.due_date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {categoryTasks.length === 0 && !isAdding && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <Wand2 size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                <p>No tasks yet for {activeCategory}.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Click "Magic Template" above to auto-generate standard tasks, or add your own!</p>
              </div>
            )}
          </ul>
          
          {isAdding ? (
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', background: 'var(--color-bg)', padding: '15px', borderRadius: '8px' }}>
              <input 
                type="text" 
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                placeholder="Task title..."
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select 
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <input 
                  type="date"
                  value={newTaskForm.due_date}
                  onChange={(e) => setNewTaskForm({...newTaskForm, due_date: e.target.value})}
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>Save Task</button>
                <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="btn-add" onClick={() => setIsAdding(true)} style={{ marginTop: '20px' }}>
              <Plus size={16} /> Add Custom Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
