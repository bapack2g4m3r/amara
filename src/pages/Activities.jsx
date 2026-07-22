import { useState } from 'react';
import { Plus, Check, Search, Trash2, Calendar, AlertCircle, Wand2, Edit2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
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
  const { tasks, addTask, updateTaskStatus, deleteTask, deleteTasksByCategory, updateTasksCategory, generateTemplateTasks } = useWeddingStore();
  const { t } = useTranslation();
  
  // Allow multiple categories to be selected
  const [selectedCategories, setSelectedCategories] = useState(['Wedding Organizer']);
  
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('amara_custom_categories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const allCategories = [...MOCK_CATEGORIES, ...customCategories.map(c => ({ id: c, name: c, isCustom: true }))];

  const [editingCustomCategory, setEditingCustomCategory] = useState(null);
  const [editCustomCategoryName, setEditCustomCategoryName] = useState('');

  const [addingCategoryId, setAddingCategoryId] = useState(null);
  const [generatingCategoryId, setGeneratingCategoryId] = useState(null);
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    priority: 'Medium',
    due_date: ''
  });
  
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    priority: 'Medium',
    due_date: ''
  });

  const getCategoryName = (categoryId) => {
    const key = `cat.${categoryId}`;
    const translated = t(key);
    return translated === key ? categoryId : translated;
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      title: task.title,
      priority: task.priority || 'Medium',
      due_date: task.due_date || ''
    });
  };

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault();
    if (!editTaskForm.title.trim()) return;
    
    await useWeddingStore.getState().updateTask(taskId, {
      title: editTaskForm.title,
      priority: editTaskForm.priority,
      due_date: editTaskForm.due_date || null
    });
    
    setEditingTaskId(null);
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
        <h1>{t('activities.title')}</h1>
        <p className="subtitle">{t('activities.subtitle')}</p>
      </header>

      <div className="activities-grid">
        {/* Step 1: Categories */}
        <div className="card categories-card">
          <div className="card-header">
            <div>
              <h3>{t('activities.step1')}</h3>
              <p>{t('activities.step1desc')}</p>
            </div>
            <Search className="icon-muted" size={20} />
          </div>
          
          <ul className="category-list">
            {allCategories.map(category => {
              const taskCount = tasks.filter(t => t.category === category.id).length;
              return (
                <li 
                  key={category.id} 
                  className={`category-item ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {editingCustomCategory === category.id ? (
                     <form onSubmit={async (e) => {
                       e.preventDefault();
                       if (!editCustomCategoryName.trim()) return;
                       const newName = editCustomCategoryName.trim();
                       
                       if (newName !== category.id) {
                         const updated = customCategories.map(c => c === category.id ? newName : c);
                         setCustomCategories(updated);
                         localStorage.setItem('amara_custom_categories', JSON.stringify(updated));
                         
                         if (selectedCategories.includes(category.id)) {
                           setSelectedCategories(prev => prev.map(c => c === category.id ? newName : c));
                         }
                         
                         await updateTasksCategory(category.id, newName);
                       }
                       setEditingCustomCategory(null);
                     }} style={{ display: 'flex', gap: '8px', padding: '10px' }}>
                       <input
                         type="text"
                         value={editCustomCategoryName}
                         onChange={e => setEditCustomCategoryName(e.target.value)}
                         style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                         autoFocus
                       />
                       <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>{t('budget.save')}</button>
                       <button type="button" onClick={() => setEditingCustomCategory(null)} className="btn-secondary" style={{ padding: '8px 12px' }}>{t('activities.cancel')}</button>
                     </form>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer', padding: '15px' }}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className={`checkbox ${selectedCategories.includes(category.id) ? 'checked' : ''}`}>
                          {selectedCategories.includes(category.id) && <Check size={14} color="white" />}
                        </div>
                        <span>{getCategoryName(category.id)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '15px' }}>
                        {taskCount > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '12px' }}>{taskCount}</span>}
                        
                        {category.isCustom && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCustomCategory(category.id);
                                setEditCustomCategoryName(category.id);
                              }} 
                              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${category.id}? All associated tasks will be deleted.`)) {
                                  const updated = customCategories.filter(c => c !== category.id);
                                  setCustomCategories(updated);
                                  localStorage.setItem('amara_custom_categories', JSON.stringify(updated));
                                  setSelectedCategories(prev => prev.filter(c => c !== category.id));
                                  await deleteTasksByCategory(category.id);
                                }
                              }} 
                              style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {isAddingCategory ? (
              <li className="category-item" style={{ padding: '10px' }}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCategoryName.trim()) return;
                  const name = newCategoryName.trim();
                  if (!allCategories.find(c => c.id.toLowerCase() === name.toLowerCase())) {
                    const updated = [...customCategories, name];
                    setCustomCategories(updated);
                    localStorage.setItem('amara_custom_categories', JSON.stringify(updated));
                  }
                  if (!selectedCategories.includes(name)) {
                    setSelectedCategories(prev => [...prev, name]);
                  }
                  setNewCategoryName('');
                  setIsAddingCategory(false);
                }} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="New category..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>Save</button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="btn-secondary" style={{ padding: '8px 12px' }}>X</button>
                </form>
              </li>
            ) : (
              <li className="category-item" onClick={() => setIsAddingCategory(true)} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', padding: '15px', color: 'var(--color-primary)', border: '1px dashed var(--color-border)', backgroundColor: 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} /> <span>Add Custom Activity</span>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Step 2: Tasks */}
        <div className="card tasks-card">
          <div className="card-header">
            <div>
              <h3>{t('activities.step2')}</h3>
              <p>{t('activities.step2desc')}</p>
            </div>
          </div>
          
          {selectedCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <p>Please select at least one category from Step 1.</p>
            </div>
          ) : (
            selectedCategories.map(categoryId => {
              const categoryTasks = tasks.filter(t => t.category === categoryId)
                                         .sort((a, b) => new Date(a.due_date || '2099-01-01') - new Date(b.due_date || '2099-01-01'));
              const isAdding = addingCategoryId === categoryId;
              const isGenerating = generatingCategoryId === categoryId;

              return (
                <div key={categoryId} style={{ marginBottom: '40px' }}>
                  <div className="active-category-header">
                    <h4>{getCategoryName(categoryId)}</h4>
                  </div>

                  <ul className="task-list-details">
                    {categoryTasks.map(task => (
                      <li key={task.id} className="task-item-detail" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                        {editingTaskId === task.id ? (
                          <form onSubmit={(e) => handleUpdateTask(e, task.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', background: 'var(--color-bg)', padding: '10px', borderRadius: '8px' }}>
                            <input 
                              type="text" 
                              value={editTaskForm.title}
                              onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                              autoFocus
                              required
                            />
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <select 
                                value={editTaskForm.priority}
                                onChange={(e) => setEditTaskForm({...editTaskForm, priority: e.target.value})}
                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                              >
                                <option value="High">{t('priority.High')} Priority</option>
                                <option value="Medium">{t('priority.Medium')} Priority</option>
                                <option value="Low">{t('priority.Low')} Priority</option>
                              </select>
                              <input 
                                type="date"
                                value={editTaskForm.due_date}
                                onChange={(e) => setEditTaskForm({...editTaskForm, due_date: e.target.value})}
                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}>{t('budget.save')}</button>
                              <button type="button" onClick={() => setEditingTaskId(null)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}>{t('activities.cancel')}</button>
                            </div>
                          </form>
                        ) : (
                          <>
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
                                      <AlertCircle size={12} /> {t(`priority.${task.priority}`)}
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
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => handleEditClick(task)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                    {categoryTasks.length === 0 && !isAdding && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                        <Wand2 size={40} style={{ color: 'var(--color-primary)', opacity: 0.8, marginBottom: '15px' }} />
                        <h4 style={{ color: 'var(--color-text)', marginBottom: '5px', fontSize: '1.1rem' }}>{t('activities.noTasks', { category: getCategoryName(categoryId) })}</h4>
                        <p style={{ marginBottom: '20px' }}>{t('activities.noTasksDesc')}</p>
                        <button 
                          className="btn-primary" 
                          onClick={async () => {
                            setGeneratingCategoryId(categoryId);
                            await generateTemplateTasks(categoryId);
                            setGeneratingCategoryId(null);
                          }} 
                          disabled={isGenerating} 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '1rem', borderRadius: '30px' }}
                        >
                          <Wand2 size={18} /> {isGenerating ? t('activities.generating') : t('activities.magicTemplate')}
                        </button>
                      </div>
                    )}
                  </ul>
                  
                  {isAdding ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newTaskForm.title.trim()) return;
                      await addTask({
                        title: newTaskForm.title,
                        category: categoryId,
                        priority: newTaskForm.priority,
                        due_date: newTaskForm.due_date || null,
                        is_completed: false
                      });
                      setNewTaskForm({ title: '', priority: 'Medium', due_date: '' });
                      setAddingCategoryId(null);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', background: 'var(--color-bg)', padding: '15px', borderRadius: '8px' }}>
                      <input 
                        type="text" 
                        value={newTaskForm.title}
                        onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                        placeholder={t('activities.taskTitle')}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select 
                          value={newTaskForm.priority}
                          onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        >
                          <option value="High">{t('priority.High')} Priority</option>
                          <option value="Medium">{t('priority.Medium')} Priority</option>
                          <option value="Low">{t('priority.Low')} Priority</option>
                        </select>
                        <input 
                          type="date"
                          value={newTaskForm.due_date}
                          onChange={(e) => setNewTaskForm({...newTaskForm, due_date: e.target.value})}
                          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>{t('activities.save')}</button>
                        <button type="button" onClick={() => {
                          setAddingCategoryId(null);
                          setNewTaskForm({ title: '', priority: 'Medium', due_date: '' });
                        }} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>{t('activities.cancel')}</button>
                      </div>
                    </form>
                  ) : (
                    <button className="btn-add" onClick={() => {
                      setAddingCategoryId(categoryId);
                      setNewTaskForm({ title: '', priority: 'Medium', due_date: '' });
                    }} style={{ marginTop: '20px' }}>
                      <Plus size={16} /> {t('activities.addCustom')}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
