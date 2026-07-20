import { useState } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import '../styles/Activities.css';

const MOCK_CATEGORIES = [
  { id: 'wo', name: 'Wedding Organizer', selected: true },
  { id: 'venue', name: 'Venue', selected: true },
  { id: 'catering', name: 'Catering', selected: true },
  { id: 'photography', name: 'Photography', selected: true },
  { id: 'mua', name: 'MUA', selected: true },
  { id: 'decor', name: 'Decor & Styling', selected: true },
  { id: 'attire', name: 'Attire', selected: false },
  { id: 'entertainment', name: 'Entertainment', selected: false },
  { id: 'live-streaming', name: 'Live Streaming', selected: false },
];

const MOCK_TASKS = {
  wo: [
    { id: 'wo-1', name: 'Initial Meeting', checked: true },
    { id: 'wo-2', name: 'Concept Discussion', checked: true },
    { id: 'wo-3', name: 'Vendor Recommendation', checked: true },
    { id: 'wo-4', name: 'Budget Planning', checked: false },
    { id: 'wo-5', name: 'Timeline & Rundown', checked: false },
    { id: 'wo-6', name: 'Final Meeting', checked: false },
    { id: 'wo-7', name: 'Rehearsal / Gladi Bersih', checked: false },
  ]
};

const Activities = () => {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('wo');

  const toggleCategory = (id) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
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
            {categories.map(category => (
              <li 
                key={category.id} 
                className={`category-item ${category.selected ? 'selected' : ''}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className={`checkbox ${category.selected ? 'checked' : ''}`}>
                  {category.selected && <Check size={14} color="white" />}
                </div>
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
          <button className="btn-add">
            <Plus size={16} /> Add Category
          </button>
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
            <h4>{categories.find(c => c.id === activeCategory)?.name}</h4>
          </div>

          <ul className="task-list-details">
            {MOCK_TASKS[activeCategory]?.map(task => (
              <li key={task.id} className="task-item-detail">
                <div className={`checkbox ${task.checked ? 'checked' : ''}`}>
                  {task.checked && <Check size={14} color="white" />}
                </div>
                <span>{task.name}</span>
              </li>
            ))}
          </ul>
          
          <button className="btn-add">
            <Plus size={16} /> Add New Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activities;
