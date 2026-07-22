import { useState } from 'react';
import { Search, Plus, Trash2, Edit3, X } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Budget.css';

const evaluateMath = (expr) => {
  if (!expr && expr !== 0) return 0;
  if (typeof expr === 'number') return expr;
  
  let str = String(expr).replace(/[Rp]/gi, '').trim();
  
  if (!/[+\-*/()]/.test(str)) {
    const cleanNum = str.replace(/[^0-9-]/g, '');
    return parseInt(cleanNum, 10) || 0;
  }
  
  str = str.replace(/[^0-9+\-*/.()]/g, '');
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${str}`)();
    return Number.isFinite(result) ? Math.round(result) : 0;
  } catch {
    return 0;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);
};

const getStatus = (paid, actual) => {
  if (paid === 0) return 'belum-bayar';
  if (paid >= actual && actual > 0) return 'lunas';
  if (paid >= actual && actual === 0) return 'lunas'; // If both 0, maybe not lunas, but let's assume if paid >= actual it's lunas. Actually if actual is 0 and paid is 0, it's belum-bayar.
  if (actual === 0 && paid === 0) return 'belum-bayar';
  return 'cicilan';
};

const getStatusText = (status, lang) => {
  if (status === 'lunas') return lang === 'id' ? 'Lunas' : 'Paid';
  if (status === 'cicilan') return lang === 'id' ? 'Cicilan' : 'Installment';
  return lang === 'id' ? 'Belum Bayar' : 'Unpaid';
};

const CATEGORIES = [
  'Venue', 'Catering', 'Dekorasi', 'Attire & Makeup', 
  'Dokumentasi', 'Entertainment', 'Undangan', 'Souvenir', 
  'Cincin & Mahar', 'Wedding Organizer', 'Lainnya'
];

const Budget = () => {
  const { budgets, expenses, addExpense, updateExpense, deleteExpense, updateBudget } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua'); // semua, belum-bayar, cicilan, lunas, terdekat
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState(budgets?.total_fund || 0);

  // Editable fields state
  // We keep track of the cell currently being edited to allow formulas
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [editValue, setEditValue] = useState('');

  const totalBudget = budgets?.total_fund || 0;
  
  // Calculations based on the new schema
  // expenses now have: planned_amount, actual_amount, paid_amount
  const validExpenses = expenses.filter(e => e.type !== 'income'); // If there were old income rows, ignore them for the table.
  
  const sudahDibayar = validExpenses.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  const totalSisaPembayaran = validExpenses.reduce((acc, curr) => {
    const actual = Number(curr.actual_amount) || 0;
    const paid = Number(curr.paid_amount) || 0;
    const sisa = actual - paid;
    return acc + (sisa > 0 ? sisa : 0);
  }, 0);
  
  const totalEstimasi = sudahDibayar + totalSisaPembayaran;
  const sisaBudget = totalBudget - totalEstimasi;

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    await updateBudget(Number(newTarget));
    setShowTargetModal(false);
  };

  const handleAddRow = async () => {
    await addExpense({
      title: 'Kebutuhan Baru',
      category: 'Lainnya',
      vendor_name: '',
      planned_amount: 0,
      actual_amount: 0,
      paid_amount: 0,
      amount: 0, // Legacy field required by DB schema
      is_paid: false,
      deadline: null,
      type: 'expense'
    });
  };

  const startEditing = (expense, field) => {
    setEditingCell({ id: expense.id, field });
    
    // Set initial value based on field
    if (field === 'title') setEditValue(expense.title || '');
    else if (field === 'category') setEditValue(expense.category || 'Lainnya');
    else if (field === 'vendor_name') setEditValue(expense.vendor_name || '');
    else if (field === 'deadline') setEditValue(expense.deadline || '');
    else if (field === 'planned_amount') setEditValue(expense.planned_amount || 0);
    else if (field === 'actual_amount') setEditValue(expense.actual_amount || 0);
    else if (field === 'paid_amount') setEditValue(expense.paid_amount || 0);
  };

  const handleBlur = async (expense) => {
    if (!editingCell) return;
    const field = editingCell.field;
    let finalValue = editValue;

    // Evaluate math if it's a numeric field
    if (['planned_amount', 'actual_amount', 'paid_amount'].includes(field)) {
      finalValue = evaluateMath(editValue);
    }

    // Only update if changed
    if (expense[field] !== finalValue) {
      await updateExpense(expense.id, { [field]: finalValue });
    }

    setEditingCell(null);
  };

  const handleKeyDown = (e, expense) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur(expense);
    }
  };

  // Filter & Search Logic
  let filteredExpenses = validExpenses.filter(e => {
    const searchLower = searchTerm.toLowerCase();
    const matchTitle = (e.title || '').toLowerCase().includes(searchLower);
    const matchVendor = (e.vendor_name || '').toLowerCase().includes(searchLower);
    const matchCat = (e.category || '').toLowerCase().includes(searchLower);
    return matchTitle || matchVendor || matchCat;
  });

  if (filterStatus !== 'semua') {
    if (filterStatus === 'terdekat') {
      filteredExpenses.sort((a, b) => {
        const dA = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
        const dB = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
        return dA - dB;
      });
    } else {
      filteredExpenses = filteredExpenses.filter(e => {
        const status = getStatus(e.paid_amount || 0, e.actual_amount || 0);
        return status === filterStatus;
      });
    }
  }

  return (
    <div className="budget-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{language === 'id' ? 'Anggaran & Pengeluaran' : 'Budget & Expenses'}</h1>
          <p className="subtitle">{language === 'id' ? 'Kelola anggaran pernikahan layaknya profesional.' : 'Manage your wedding budget like a pro.'}</p>
        </div>
      </header>

      {/* Summary Grid */}
      <div className="budget-summary-grid">
        <div className="summary-card highlight" style={{ cursor: 'pointer' }} onClick={() => setShowTargetModal(true)} title={language === 'id' ? 'Klik untuk ubah budget' : 'Click to edit budget'}>
          <h3>{language === 'id' ? 'Total Budget' : 'Total Budget'} <Edit3 size={14} /></h3>
          <p className="amount">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="summary-card">
          <h3>{language === 'id' ? 'Total Estimasi' : 'Total Estimate'}</h3>
          <p className="amount">{formatCurrency(totalEstimasi)}</p>
        </div>
        <div className="summary-card">
          <h3>{language === 'id' ? 'Sudah Dibayar' : 'Amount Paid'}</h3>
          <p className="amount" style={{ color: 'var(--color-success)' }}>{formatCurrency(sudahDibayar)}</p>
        </div>
        <div className="summary-card">
          <h3>{language === 'id' ? 'Sisa Pembayaran' : 'Remaining Payment'}</h3>
          <p className="amount" style={{ color: 'var(--color-warning)' }}>{formatCurrency(totalSisaPembayaran)}</p>
        </div>
        <div className="summary-card">
          <h3>{language === 'id' ? 'Sisa Budget' : 'Remaining Budget'}</h3>
          <p className="amount" style={{ color: sisaBudget < 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>{formatCurrency(sisaBudget)}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="budget-table-section">
        <div className="table-toolbar">
          <div className="filter-pills">
            <button className={`filter-pill ${filterStatus === 'semua' ? 'active' : ''}`} onClick={() => setFilterStatus('semua')}>Semua</button>
            <button className={`filter-pill ${filterStatus === 'belum-bayar' ? 'active' : ''}`} onClick={() => setFilterStatus('belum-bayar')}>Belum Bayar</button>
            <button className={`filter-pill ${filterStatus === 'cicilan' ? 'active' : ''}`} onClick={() => setFilterStatus('cicilan')}>Cicilan</button>
            <button className={`filter-pill ${filterStatus === 'lunas' ? 'active' : ''}`} onClick={() => setFilterStatus('lunas')}>Lunas</button>
            <button className={`filter-pill ${filterStatus === 'terdekat' ? 'active' : ''}`} onClick={() => setFilterStatus('terdekat')}>Deadline Terdekat</button>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={language === 'id' ? 'Cari kebutuhan atau vendor...' : 'Search item or vendor...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="budget-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Kebutuhan</th>
                <th style={{ width: '15%' }}>Vendor</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Budget</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Aktual</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Dibayar</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Sisa</th>
                <th style={{ width: '10%' }}>Deadline</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '1%' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => {
                const actual = Number(expense.actual_amount) || 0;
                const paid = Number(expense.paid_amount) || 0;
                const sisa = Math.max(actual - paid, 0);
                const status = getStatus(paid, actual);
                
                const isEditing = (field) => editingCell?.id === expense.id && editingCell?.field === field;

                return (
                  <tr key={expense.id}>
                    {/* Kebutuhan (Dropdown) */}
                    <td>
                      {isEditing('category') ? (
                        <select 
                          className="editable-select"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          autoFocus
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      ) : (
                        <div onClick={() => startEditing(expense, 'category')} style={{ cursor: 'pointer', fontWeight: '500' }}>
                          {expense.category || 'Pilih...'}
                        </div>
                      )}
                      
                      {/* Title input below category (optional, kept for details) */}
                      {isEditing('title') ? (
                        <input 
                          type="text" 
                          className="editable-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          style={{ marginTop: '4px', fontSize: '0.8rem', padding: '4px' }}
                        />
                      ) : (
                        <div onClick={() => startEditing(expense, 'title')} style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {expense.title || '+ Detail'}
                        </div>
                      )}
                    </td>

                    {/* Vendor Name */}
                    <td>
                      {isEditing('vendor_name') ? (
                        <input 
                          type="text" 
                          className="editable-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                        />
                      ) : (
                        <div onClick={() => startEditing(expense, 'vendor_name')} style={{ cursor: 'pointer', minHeight: '20px' }}>
                          {expense.vendor_name || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Tulis...</span>}
                        </div>
                      )}
                    </td>

                    {/* Budget (Planned) */}
                    <td>
                      {isEditing('planned_amount') ? (
                        <input 
                          type="text" 
                          className="editable-input math-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          placeholder="e.g. 20000*5"
                        />
                      ) : (
                        <span className="amount-text" onClick={() => startEditing(expense, 'planned_amount')} style={{ cursor: 'pointer' }}>
                          {formatCurrency(expense.planned_amount)}
                        </span>
                      )}
                    </td>

                    {/* Aktual */}
                    <td>
                      {isEditing('actual_amount') ? (
                        <input 
                          type="text" 
                          className="editable-input math-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          placeholder="e.g. 20000*5"
                        />
                      ) : (
                        <span className="amount-text" onClick={() => startEditing(expense, 'actual_amount')} style={{ cursor: 'pointer' }}>
                          {formatCurrency(expense.actual_amount)}
                        </span>
                      )}
                    </td>

                    {/* Dibayar */}
                    <td>
                      {isEditing('paid_amount') ? (
                        <input 
                          type="text" 
                          className="editable-input math-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                        />
                      ) : (
                        <span className="amount-text" onClick={() => startEditing(expense, 'paid_amount')} style={{ cursor: 'pointer', color: expense.paid_amount > 0 ? 'var(--color-success)' : 'inherit' }}>
                          {formatCurrency(expense.paid_amount)}
                        </span>
                      )}
                    </td>

                    {/* Sisa (Auto) */}
                    <td>
                      <span className="amount-text" style={{ color: sisa > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                        {formatCurrency(sisa)}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td>
                      {isEditing('deadline') ? (
                        <input 
                          type="date" 
                          className="editable-input" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                        />
                      ) : (
                        <div onClick={() => startEditing(expense, 'deadline')} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                          {expense.deadline ? new Date(expense.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : <span style={{ color: 'var(--color-text-muted)' }}>Set date</span>}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${status}`}>
                        {getStatusText(status, language)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <button onClick={() => deleteExpense(expense.id)} className="btn-icon" style={{ color: 'var(--color-danger)', border: 'none', background: 'transparent' }} title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <button className="add-row-btn" onClick={handleAddRow}>
            <Plus size={18} /> {language === 'id' ? 'Tambah Kebutuhan' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowTargetModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('budget.editTarget')}</h3>
            <form onSubmit={handleUpdateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('budget.targetAmount')} (Rp)</label>
                <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)', outline: 'none' }} />
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
