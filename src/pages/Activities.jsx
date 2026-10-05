import { useState } from 'react';
import { Plus, Search, Trash2, Calendar, Wand2, Edit2, Check, X, Users } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { formatDate } from '../utils/dateFormatter';
import { getPartnerNames, formatTaskPic } from '../utils/partnerHelper';
import ConfirmModal from '../components/ConfirmModal';
import TutorialTriggerButton from '../components/TutorialTriggerButton';
import '../styles/Activities.css';

const MOCK_CATEGORIES = [
  { id: 'Persiapan Awal', name: 'Persiapan Awal' },
  { id: 'Lamaran', name: 'Lamaran' },
  { id: 'Seserahan, Mahar, dan Cincin', name: 'Seserahan, Mahar, dan Cincin' },
  { id: 'Wedding Organizer', name: 'Wedding Organizer' },
  { id: 'Venue', name: 'Venue' },
  { id: 'Administrasi', name: 'Administrasi' },
  { id: 'Catering', name: 'Catering' },
  { id: 'Dekorasi', name: 'Dekorasi' },
  { id: 'Attire', name: 'Attire' },
  { id: 'MUA', name: 'MUA' },
  { id: 'Dokumentasi', name: 'Dokumentasi' },
  { id: 'MC & Entertainment', name: 'MC & Entertainment' },
  { id: 'Undangan', name: 'Undangan' },
  { id: 'Others', name: 'Others' }
];

const Activities = () => {
  const { tasks, addTask, deleteTask, deleteTasksByCategory, updateTasksCategory, generateTemplateTasks, updateTaskStatus, userRole } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const profile = useWeddingStore(state => state.profile);
  const { groomName, brideName } = getPartnerNames(profile);
  const { t, language } = useTranslation();
  
  // Selected category (only one at a time)
  const [activeCategory, setActiveCategory] = useState('Persiapan Awal');
  
  const customCategories = useWeddingStore(state => state.customCategories);
  const { updateCustomCategories } = useWeddingStore();

  const allCategories = [...MOCK_CATEGORIES, ...customCategories.map(c => ({ id: c, name: c, isCustom: true }))];

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPicFilter, setSelectedPicFilter] = useState('ALL'); // 'ALL' | 'CPP' | 'CPW' | 'Bersama'

  const [editingCustomCategory, setEditingCustomCategory] = useState(null);
  const [editCustomCategoryName, setEditCustomCategoryName] = useState('');

  const [addingCategoryId, setAddingCategoryId] = useState(null);
  const [generatingCategoryId, setGeneratingCategoryId] = useState(null);
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    priority: 'Medium',
    due_date: '',
    pic: 'Bersama'
  });
  
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    priority: 'Medium',
    due_date: '',
    pic: 'Bersama'
  });

  // Delete Confirmation States
  const [deletingTask, setDeletingTask] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getCategoryName = (categoryId) => {
    const key = `cat.${categoryId}`;
    const translated = t(key);
    return translated === key ? categoryId : translated;
  };

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    // Smooth scroll the Tasks Card into view on mobile, landscape, iPad Mini, and all stacked layouts
    setTimeout(() => {
      const categoriesCard = document.querySelector('.categories-card');
      const tasksCard = document.querySelector('.tasks-card');
      if (tasksCard) {
        // If layout is stacked (tasksCard below categoriesCard) or screen width is tablet/mobile
        const isStacked = categoriesCard 
          ? tasksCard.getBoundingClientRect().top > categoriesCard.getBoundingClientRect().bottom - 20
          : true;
        const isTabletOrMobile = window.innerWidth <= 1280 || window.innerHeight <= 700;

        if (isStacked || isTabletOrMobile) {
          tasksCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 60);
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      title: getDynamicTaskTitle(task.title, language),
      priority: task.priority || 'Medium',
      due_date: task.due_date || '',
      pic: task.pic || 'Bersama'
    });
  };

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault();
    if (!editTaskForm.title.trim()) return;
    
    await useWeddingStore.getState().updateTask(taskId, {
      title: editTaskForm.title,
      priority: editTaskForm.priority || 'Medium',
      due_date: editTaskForm.due_date || null,
      pic: editTaskForm.pic || 'Bersama'
    });
    
    setEditingTaskId(null);
  };

  const filteredCategories = allCategories.filter(category => 
    getCategoryName(category.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="activities-container">
      <header className="page-header has-tutorial-btn">
        <div>
          <h1>{t('activities.title')}</h1>
          <p className="subtitle">{t('activities.subtitle')}</p>
        </div>
        <TutorialTriggerButton />
      </header>

      <div className="activities-grid">
        <div className="card categories-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
            {!isSearching ? (
              <>
                <div>
                  <h3>{t('activities.step1')}</h3>
                  <p>{t('activities.step1desc')}</p>
                </div>
                <button onClick={() => setIsSearching(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Search className="icon-muted" size={20} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
                <Search className="icon-muted" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities..."
                  style={{ flex: 1, padding: '8px', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'var(--color-text)' }}
                  autoFocus
                />
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>
                  &times;
                </button>
              </div>
            )}
          </div>
          
          <ul className="category-list">
            {filteredCategories.map(category => {
              const taskCount = tasks.filter(t => t.category === category.id).length;
              return (
                <li 
                  key={category.id} 
                  className={`category-item ${activeCategory === category.id ? 'selected' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {editingCustomCategory === category.id ? (
                     <form onSubmit={async (e) => {
                       e.preventDefault();
                       if (!editCustomCategoryName.trim()) return;
                       const newName = editCustomCategoryName.trim();
                       
                       if (newName !== category.id) {
                         const updated = customCategories.map(c => c === category.id ? newName : c);
                         updateCustomCategories(updated);
                         
                         if (activeCategory === category.id) {
                           setActiveCategory(newName);
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
                    <div className="category-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div 
                        className="category-item-clickable"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <span className="category-item-name">{getCategoryName(category.id)}</span>
                      </div>
                      
                      <div className="category-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {taskCount > 0 && <span className="category-task-count" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-bg)', padding: '2px 8px', borderRadius: '12px' }}>{taskCount}</span>}
                        
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCategory(category.id);
                              }} 
                              style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                              title={language === 'id' ? "Hapus kategori" : "Delete category"}
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
          </ul>
        </div>

        <div className="card tasks-card">
          <div className="card-header">
            <div>
              <h3>{t('activities.step2')}</h3>
              <p>{t('activities.step2desc')}</p>
            </div>
          </div>
          
          {!activeCategory ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <p>Please select a category from Step 1.</p>
            </div>
          ) : (
            <>
              {(() => {
                const categoryId = activeCategory;
                const categoryTasks = tasks.filter(t => t.category === categoryId)
                                           .sort((a, b) => new Date(a.due_date || '2099-01-01') - new Date(b.due_date || '2099-01-01'));
                const isAdding = addingCategoryId === categoryId;
                const isGenerating = generatingCategoryId === categoryId;

                // PIC Filter Counts & Filtered Tasks
                const countAll = categoryTasks.length;
                const countCpp = categoryTasks.filter(t => t.pic === 'CPP').length;
                const countCpw = categoryTasks.filter(t => t.pic === 'CPW').length;
                const countBersama = categoryTasks.filter(t => (t.pic || 'Bersama') === 'Bersama').length;

                const displayedTasks = selectedPicFilter === 'ALL'
                  ? categoryTasks
                  : selectedPicFilter === 'Bersama'
                    ? categoryTasks.filter(t => (t.pic || 'Bersama') === 'Bersama')
                    : categoryTasks.filter(t => t.pic === selectedPicFilter);

                return (
                  <div style={{ marginBottom: '10px' }}>
                    <div className="active-category-header">
                      <h4>{getCategoryName(categoryId)}</h4>
                      <button 
                        type="button" 
                        className="btn-change-category-mobile"
                        onClick={() => {
                          const categoriesCard = document.querySelector('.categories-card');
                          if (categoriesCard) {
                            categoriesCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {language === 'id' ? '← Pilih Kategori Lain' : '← Change Category'}
                      </button>
                    </div>

                    {/* PIC Filter Pills */}
                    {categoryTasks.length > 0 && (
                      <div className="pic-filter-pills">
                        <button 
                          type="button" 
                          className={`pic-filter-btn ${selectedPicFilter === 'ALL' ? 'active' : ''}`}
                          onClick={() => setSelectedPicFilter('ALL')}
                        >
                          <span>{language === 'id' ? 'Semua' : 'All'}</span>
                          <span className="pic-filter-count">{countAll}</span>
                        </button>
                        <button 
                          type="button" 
                          className={`pic-filter-btn pic-cpp ${selectedPicFilter === 'CPP' ? 'active' : ''}`}
                          onClick={() => setSelectedPicFilter('CPP')}
                        >
                          <span>{language === 'id' ? `Tugas ${groomName}` : `${groomName}'s Tasks`}</span>
                          <span className="pic-filter-count">{countCpp}</span>
                        </button>
                        <button 
                          type="button" 
                          className={`pic-filter-btn pic-cpw ${selectedPicFilter === 'CPW' ? 'active' : ''}`}
                          onClick={() => setSelectedPicFilter('CPW')}
                        >
                          <span>{language === 'id' ? `Tugas ${brideName}` : `${brideName}'s Tasks`}</span>
                          <span className="pic-filter-count">{countCpw}</span>
                        </button>
                        <button 
                          type="button" 
                          className={`pic-filter-btn pic-bersama ${selectedPicFilter === 'Bersama' ? 'active' : ''}`}
                          onClick={() => setSelectedPicFilter('Bersama')}
                        >
                          <span>{language === 'id' ? 'Tugas Bersama' : 'Joint Tasks'}</span>
                          <span className="pic-filter-count">{countBersama}</span>
                        </button>
                      </div>
                    )}

                    {categoryTasks.length > 0 && displayedTasks.length === 0 && (
                      <div className="pic-empty-filter-state">
                        <p style={{ margin: 0, fontWeight: 500 }}>
                          {language === 'id' 
                            ? `Tidak ada tugas untuk ${selectedPicFilter === 'CPP' ? `Tugas ${groomName}` : selectedPicFilter === 'CPW' ? `Tugas ${brideName}` : 'Tugas Bersama'} di kategori ini.`
                            : `No tasks assigned to ${selectedPicFilter === 'CPP' ? groomName : selectedPicFilter === 'CPW' ? brideName : 'Joint Tasks'} in this category.`}
                        </p>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => setSelectedPicFilter('ALL')}
                          style={{ marginTop: '10px', fontSize: '0.85rem', padding: '6px 14px' }}
                        >
                          {language === 'id' ? 'Tampilkan Semua Tugas' : 'Show All Tasks'}
                        </button>
                      </div>
                    )}

                    {categoryTasks.length > 0 && (
                      <ul className="task-list-details">
                        {displayedTasks.map(task => (
                          <li key={task.id} className="task-item-detail">
                            {editingTaskId === task.id ? (
                              <form onSubmit={(e) => handleUpdateTask(e, task.id)} className="task-form-container">
                                <div className="task-form-field">
                                  <label className="task-form-label">
                                    {language === 'id' ? 'Judul Tugas' : 'Task Title'}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={editTaskForm.title}
                                    onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                                    className="task-form-title-input"
                                    placeholder={language === 'id' ? 'cth: Survey cincin pernikahan' : 'e.g. Survey wedding rings'}
                                    autoFocus
                                    required
                                  />
                                </div>

                                <div className="task-form-row">
                                  <div className="task-form-field">
                                    <label className="task-form-label">
                                      <Calendar size={13} />
                                      <span>{language === 'id' ? 'Tanggal Deadline' : 'Deadline Date'}</span>
                                    </label>
                                    <div className="task-date-input-wrapper">
                                      <input 
                                        type="date"
                                        value={editTaskForm.due_date}
                                        onChange={(e) => setEditTaskForm({...editTaskForm, due_date: e.target.value})}
                                        className={`task-date-input ${editTaskForm.due_date ? 'has-value' : ''}`}
                                      />
                                      {editTaskForm.due_date && (
                                        <button 
                                          type="button" 
                                          className="task-date-clear-btn"
                                          onClick={() => setEditTaskForm({...editTaskForm, due_date: ''})}
                                          title={language === 'id' ? "Hapus tanggal" : "Clear date"}
                                        >
                                          <X size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="task-form-field">
                                    <label className="task-form-label">
                                      <Users size={13} />
                                      <span>{language === 'id' ? 'Penanggung Jawab (PIC)' : 'Assignee (PIC)'}</span>
                                    </label>
                                    <select
                                      value={editTaskForm.pic || 'Bersama'}
                                      onChange={(e) => setEditTaskForm({...editTaskForm, pic: e.target.value})}
                                      className="task-select-input"
                                    >
                                      <option value="Bersama">{language === 'id' ? 'Tugas Bersama' : 'Joint Task'}</option>
                                      <option value="CPP">{language === 'id' ? `Tugas ${groomName}` : `${groomName}'s Task`}</option>
                                      <option value="CPW">{language === 'id' ? `Tugas ${brideName}` : `${brideName}'s Task`}</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="task-form-actions">
                                  <button type="submit" className="btn-primary">{t('budget.save')}</button>
                                  <button type="button" onClick={() => setEditingTaskId(null)} className="btn-secondary">{t('activities.cancel')}</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="task-detail-left">
                                  <button 
                                    type="button"
                                    className={`btn-check ${task.is_completed ? 'checked' : ''}`}
                                    onClick={() => !isReadOnly && updateTaskStatus(task.id, !task.is_completed)}
                                    disabled={isReadOnly}
                                    style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer', opacity: isReadOnly ? 0.6 : 1 }}
                                    title={isReadOnly ? (language === 'id' ? "Hanya dapat dilihat" : "View-only") : (task.is_completed ? (language === 'id' ? "Tandai belum selesai" : "Mark as incomplete") : (language === 'id' ? "Tandai selesai" : "Mark as completed"))}
                                  >
                                    {task.is_completed && <Check size={12} color="white" />}
                                  </button>
                                  <div className="task-detail-body">
                                    <span className="task-detail-title" style={{ 
                                      textDecoration: task.is_completed ? 'line-through' : 'none',
                                      color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                                      opacity: task.is_completed ? 0.65 : 1,
                                      transition: 'all 0.2s'
                                    }}>
                                      {getDynamicTaskTitle(task.title, language)}
                                    </span>
                                    <div className="task-detail-meta">
                                      {task.due_date && (
                                        <span className="task-detail-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Calendar size={12} /> {formatDate(task.due_date)}
                                        </span>
                                      )}
                                      <span className={`task-pic-badge pic-${(task.pic || 'Bersama').toLowerCase()}`}>
                                        {formatTaskPic(task.pic, profile)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!isReadOnly && (
                                  <div className="task-detail-actions" style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                    <button onClick={() => handleEditClick(task)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setDeletingTask(task)} 
                                      style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                      title={language === 'id' ? "Hapus tugas" : "Delete task"}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {categoryTasks.length === 0 && !isAdding && (
                      <div className="activities-empty-state">
                        <div className="activities-empty-icon">
                          <Wand2 size={26} />
                        </div>
                        <h4 className="activities-empty-title">{t('activities.noTasks', { category: getCategoryName(categoryId) })}</h4>
                        <p className="activities-empty-desc">{t('activities.noTasksDesc')}</p>
                        <button 
                          type="button"
                          className="btn-magic-template" 
                          onClick={async () => {
                            setGeneratingCategoryId(categoryId);
                            await generateTemplateTasks(categoryId);
                            setGeneratingCategoryId(null);
                          }} 
                          disabled={isGenerating} 
                        >
                          <Wand2 size={16} /> {isGenerating ? t('activities.generating') : t('activities.magicTemplate')}
                        </button>
                      </div>
                    )}
                    
                    {isAdding ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newTaskForm.title.trim()) return;
                        await addTask({
                          title: newTaskForm.title,
                          category: categoryId,
                          priority: 'Medium',
                          due_date: newTaskForm.due_date || null,
                          is_completed: false,
                          pic: newTaskForm.pic || 'Bersama'
                        });
                        setNewTaskForm({ title: '', priority: 'Medium', due_date: '', pic: 'Bersama' });
                        setAddingCategoryId(null);
                      }} className="task-form-container add-task-form">
                        <div className="task-form-field">
                          <label className="task-form-label">
                            {language === 'id' ? 'Judul Tugas' : 'Task Title'}
                          </label>
                          <input 
                            type="text" 
                            value={newTaskForm.title}
                            onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                            placeholder={t('activities.taskTitle')}
                            className="task-form-title-input"
                            autoFocus
                          />
                        </div>

                        <div className="task-form-row">
                          <div className="task-form-field">
                            <label className="task-form-label">
                              <Calendar size={13} />
                              <span>{language === 'id' ? 'Tanggal Deadline' : 'Deadline Date'}</span>
                            </label>
                            <div className="task-date-input-wrapper">
                              <input 
                                type="date"
                                value={newTaskForm.due_date}
                                onChange={(e) => setNewTaskForm({...newTaskForm, due_date: e.target.value})}
                                className={`task-date-input ${newTaskForm.due_date ? 'has-value' : ''}`}
                              />
                              {newTaskForm.due_date && (
                                <button 
                                  type="button" 
                                  className="task-date-clear-btn"
                                  onClick={() => setNewTaskForm({...newTaskForm, due_date: ''})}
                                  title={language === 'id' ? "Hapus tanggal" : "Clear date"}
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="task-form-field">
                            <label className="task-form-label">
                              <Users size={13} />
                              <span>{language === 'id' ? 'Penanggung Jawab (PIC)' : 'Assignee (PIC)'}</span>
                            </label>
                            <select
                              value={newTaskForm.pic || 'Bersama'}
                              onChange={(e) => setNewTaskForm({...newTaskForm, pic: e.target.value})}
                              className="task-select-input"
                            >
                              <option value="Bersama">{language === 'id' ? 'Tugas Bersama' : 'Joint Task'}</option>
                              <option value="CPP">{language === 'id' ? `Tugas ${groomName}` : `${groomName}'s Task`}</option>
                              <option value="CPW">{language === 'id' ? `Tugas ${brideName}` : `${brideName}'s Task`}</option>
                            </select>
                          </div>
                        </div>

                        <div className="task-form-actions">
                          <button type="submit" className="btn-primary">{t('activities.save')}</button>
                          <button type="button" onClick={() => {
                            setAddingCategoryId(null);
                            setNewTaskForm({ title: '', priority: 'Medium', due_date: '', pic: selectedPicFilter !== 'ALL' ? selectedPicFilter : 'Bersama' });
                          }} className="btn-secondary">{t('activities.cancel')}</button>
                        </div>
                      </form>
                    ) : !isReadOnly ? (
                      <button className="btn-add" onClick={() => {
                        setAddingCategoryId(categoryId);
                        setNewTaskForm({ title: '', priority: 'Medium', due_date: '', pic: selectedPicFilter !== 'ALL' ? selectedPicFilter : 'Bersama' });
                      }} style={{ marginTop: '20px' }}>
                        <Plus size={16} /> {t('activities.addCustom')}
                      </button>
                    ) : null}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Task Deletion */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => {
          if (!isDeleting) setDeletingTask(null);
        }}
        onConfirm={async () => {
          if (!deletingTask) return;
          try {
            setIsDeleting(true);
            await deleteTask(deletingTask.id);
            setDeletingTask(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus tugas ini?' : 'Delete this task?'}
        message={language === 'id' ? 'Tugas yang dihapus tidak dapat dikembalikan.' : 'Deleted tasks cannot be recovered.'}
        itemName={deletingTask ? getDynamicTaskTitle(deletingTask.title, language) : ''}
        confirmText={language === 'id' ? 'Hapus' : 'Delete'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />

      {/* Confirmation Modal for Category Deletion */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => {
          if (!isDeleting) setDeletingCategory(null);
        }}
        onConfirm={async () => {
          if (!deletingCategory) return;
          try {
            setIsDeleting(true);
            const updated = customCategories.filter(c => c !== deletingCategory);
            updateCustomCategories(updated);
            if (activeCategory === deletingCategory) {
              setActiveCategory('Persiapan Awal');
            }
            await deleteTasksByCategory(deletingCategory);
            setDeletingCategory(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus kategori ini?' : 'Delete this category?'}
        message={language === 'id' ? 'Semua tugas di dalam kategori ini akan terhapus permanen dan tidak dapat dikembalikan.' : 'All tasks in this category will be permanently deleted.'}
        itemName={deletingCategory || ''}
        confirmText={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};

export default Activities;
