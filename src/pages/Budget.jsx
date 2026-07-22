import { useState } from 'react';
import { Plus, Download, X, Trash2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Budget.css';

const Budget = () => {
  const { budgets, expenses, addExpense, deleteExpense, updateBudget } = useWeddingStore();
  const { t } = useTranslation();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Venue & Rentals',
    amount: '',
    type: 'expense'
  });
  
  const [newTarget, setNewTarget] = useState(budgets?.total_fund || 0);

  const targetAmount = budgets?.total_fund || 0;
  
  // Calculations
  const incomes = expenses.filter(e => e.type === 'income');
  const outgoings = expenses.filter(e => e.type === 'expense');
  
  const totalCollected = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSpent = outgoings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const collectedPercentage = targetAmount > 0 ? Math.min((totalCollected / targetAmount) * 100, 100).toFixed(0) : 0;
  const amountLeft = targetAmount - totalCollected;

  // Group expenses by category
  const expensesByCategory = outgoings.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;
    
    await addExpense({
      title: expenseForm.title,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      type: expenseForm.type,
      is_paid: true
    });
    
    setShowExpenseModal(false);
    setExpenseForm({ title: '', category: 'Venue & Rentals', amount: '', type: 'expense' });
  };

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    await updateBudget(Number(newTarget));
    setShowTargetModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="budget-container">
      <header className="page-header">
        <h1>{t('budget.title')}</h1>
        <p className="subtitle">{t('budget.subtitle')}</p>
      </header>

      <div className="budget-grid">
        {/* Main Budget Card */}
        <div className="card total-budget-card">
          <div className="budget-header">
            <h3>{t('budget.totalFund').toUpperCase()}</h3>
            <button className="btn-icon-light" onClick={() => setShowTargetModal(true)}>{t('budget.editTarget')}</button>
          </div>
          <div className="total-amount">
            <h2>{formatCurrency(totalCollected)}</h2>
            <div className="split-amount">
              <span>{formatCurrency(targetAmount)}<br/>{t('budget.targetAmount')}</span>
            </div>
          </div>
          <div className="progress-bar-bg-light">
            <div className="progress-bar-fill-light" style={{ width: `${collectedPercentage}%` }}></div>
          </div>
          <div className="budget-stats">
            <span>{collectedPercentage}% Collected</span>
            <span>{formatCurrency(Math.max(amountLeft, 0))} Left to collect</span>
          </div>
          <div className="budget-actions">
            <button className="btn-primary btn-full" onClick={() => { setExpenseForm({...expenseForm, type: 'income'}); setShowExpenseModal(true); }}>
              <Plus size={16}/> {t('budget.addFund').toUpperCase()}
            </button>
            <button className="btn-secondary btn-full" onClick={() => { setExpenseForm({...expenseForm, type: 'expense'}); setShowExpenseModal(true); }}>
              {t('budget.addExpense').toUpperCase()}
            </button>
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="card allocation-card">
          <div className="section-header">
            <h3>Expenses Allocation</h3>
            <span className="spent-total">Total Spent: {formatCurrency(totalSpent)}</span>
          </div>
          <ul className="allocation-list">
            {Object.entries(expensesByCategory).length > 0 ? (
              Object.entries(expensesByCategory).map(([category, amount]) => (
                <li className="allocation-item" key={category}>
                  <div className="icon-box bg-purple"><span className="icon">💰</span></div>
                  <div className="item-details">
                    <h4>{category}</h4>
                  </div>
                  <div className="item-amounts">
                    <span className="spent highlight-red">{formatCurrency(amount)}</span>
                  </div>
                </li>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No expenses recorded yet.</p>
            )}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity-card">
          <div className="section-header">
            <h3>Recent Activity</h3>
          </div>
          <ul className="activity-list">
            {expenses.slice().reverse().map(activity => (
              <li className="activity-item" key={activity.id}>
                <div className="icon-box-small">
                  <span className="icon">{activity.type === 'income' ? '💸' : '💳'}</span>
                </div>
                <div className="activity-details">
                  <h4>{activity.title}</h4>
                  <p>{new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`activity-amount ${activity.type === 'income' ? 'positive' : 'negative'}`}>
                    {activity.type === 'income' ? '+' : '-'} {formatCurrency(activity.amount)}
                  </div>
                  <button onClick={() => deleteExpense(activity.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
            {expenses.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No recent activity.</p>
            )}
          </ul>
        </div>

      </div>

      {/* Expense/Income Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowExpenseModal(false)} style={{ position: 'absolute', right: '15px', top: '15px' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{expenseForm.type === 'income' ? t('budget.addFund') : t('budget.addExpense')}</h3>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('budget.description')}</label>
                <input type="text" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('budget.amount')} (Rp)</label>
                <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              {expenseForm.type === 'expense' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('vendor.category')}</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }}>
                    <option>Venue & Rentals</option>
                    <option>Catering Services</option>
                    <option>Decoration & Florist</option>
                    <option>Attire & Makeup</option>
                    <option>Photography & Videography</option>
                    <option>Entertainment</option>
                    <option>Miscellaneous</option>
                  </select>
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowTargetModal(false)} style={{ position: 'absolute', right: '15px', top: '15px' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('budget.editTarget')}</h3>
            <form onSubmit={handleUpdateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('budget.targetAmount')} (Rp)</label>
                <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Budget;
