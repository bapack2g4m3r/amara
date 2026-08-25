import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, X, ArrowUpDown, GripHorizontal } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Budget.css';

const evaluateMath = (expr) => {
  if (!expr && expr !== 0) return 0;
  if (typeof expr === 'number') return expr;
  
  let str = String(expr).replace(/[Rp]/gi, '').trim();
  str = str.replace(/\./g, '').replace(/,/g, '.');
  
  if (!/[+\-*/()]/.test(str)) {
    const cleanNum = str.replace(/[^0-9.-]/g, '');
    return parseFloat(cleanNum) || 0;
  }
  
  str = str.replace(/[^0-9+\-*/.()]/g, '');
  try {
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
  if (paid >= actual && actual === 0) return 'lunas'; 
  if (actual === 0 && paid === 0) return 'belum-bayar';
  return 'cicilan';
};

const getStatusText = (status, lang) => {
  if (status === 'lunas') return lang === 'id' ? 'Lunas' : 'Paid';
  if (status === 'cicilan') return lang === 'id' ? 'Cicilan' : 'Installment';
  return lang === 'id' ? 'Belum Bayar' : 'Unpaid';
};

const CATEGORIES = [
  'Venue', 'Catering', 'Dekorasi', 'Attire', 'Makeup', 
  'Dokumentasi', 'Entertainment', 'Undangan', 'Souvenir', 
  'Cincin', 'Mahar', 'Seserahan', 'Wedding Organizer', 'Lainnya'
];

const CATEGORY_TRANSLATIONS = {
  'Venue': 'Venue',
  'Catering': 'Catering',
  'Dekorasi': 'Decoration',
  'Attire': 'Attire',
  'Makeup': 'Makeup',
  'Dokumentasi': 'Documentation',
  'Entertainment': 'Entertainment',
  'Undangan': 'Invitation',
  'Souvenir': 'Souvenir',
  'Cincin': 'Rings',
  'Mahar': 'Dowry',
  'Seserahan': 'Gifts (Seserahan)',
  'Wedding Organizer': 'Wedding Organizer',
  'Lainnya': 'Others'
};

const DEFAULT_COLUMNS = [
  { id: 'kebutuhan', labelId: 'Kebutuhan', labelEn: 'Item', width: '15%' },
  { id: 'vendor_name', labelId: 'Vendor', labelEn: 'Vendor', width: '15%' },
  { id: 'planned_amount', labelId: 'Budget', labelEn: 'Budget', width: '13%' },
  { id: 'actual_amount', labelId: 'Aktual', labelEn: 'Actual', width: '13%' },
  { id: 'paid_amount', labelId: 'Dibayar', labelEn: 'Paid', width: '13%' },
  { id: 'sisa', labelId: 'Sisa', labelEn: 'Remaining', width: '12%' },
  { id: 'deadline', labelId: 'Deadline', labelEn: 'Deadline', width: '10%' },
  { id: 'status', labelId: 'Status', labelEn: 'Status', width: '8%' }
];

const Budget = () => {
  const { budgets, expenses, addExpense, updateExpense, deleteExpense, updateBudget } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatuses, setFilterStatuses] = useState([]); // Multiple filters
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState(budgets?.total_fund || 0);

  // Columns
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  // Editable fields state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const totalBudget = budgets?.total_fund || 0;
  
  const validExpenses = expenses.filter(e => e.type !== 'income');
  
  const sudahDibayar = validExpenses.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  const totalSisaPembayaran = validExpenses.reduce((acc, curr) => {
    const actual = Number(curr.actual_amount) || 0;
    const paid = Number(curr.paid_amount) || 0;
    const sisa = actual - paid;
    return acc + (sisa > 0 ? sisa : 0);
  }, 0);
  
  const totalAktual = sudahDibayar + totalSisaPembayaran;
  const rencanaPengeluaran = validExpenses.reduce((acc, curr) => acc + (Number(curr.planned_amount) || 0), 0);
  const sisaBudget = totalBudget - totalAktual;

  // Budget Health logic
  const getBudgetHealth = () => {
    if (totalBudget === 0) return { status: 'No Budget Set', color: '#9CA3AF', percentage: 0 };
    
    let hasLatePayment = false;
    let hasPaymentDue3Days = false;
    let hasPaymentDue7Days = false;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    validExpenses.forEach(e => {
       const actual = Number(e.actual_amount) || 0;
       const paid = Number(e.paid_amount) || 0;
       const sisa = actual - paid;
       
       if (sisa > 0 && e.deadline) {
          const dl = new Date(e.deadline);
          dl.setHours(0,0,0,0);
          const diffTime = dl - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) hasLatePayment = true;
          else if (diffDays <= 3) hasPaymentDue3Days = true;
          else if (diffDays <= 7) hasPaymentDue7Days = true;
       }
    });

    const isOverBudget = totalAktual > totalBudget;
    const overBudgetPercentage = isOverBudget ? ((totalAktual - totalBudget) / totalBudget) * 100 : 0;
    const budgetUsedPercentage = (totalAktual / totalBudget) * 100;
    
    // Cap progress bar at 100% visually
    const progressWidth = Math.min(budgetUsedPercentage, 100);

    if (hasLatePayment && overBudgetPercentage > 10) return { status: 'Critical', color: '#EF4444', percentage: progressWidth, labelId: 'Kritis' };
    if (hasLatePayment || overBudgetPercentage > 0) return { status: 'Action Required', color: '#F97316', percentage: progressWidth, labelId: 'Perlu Tindakan' };
    if (hasPaymentDue3Days) return { status: 'Needs Attention', color: '#EAB308', percentage: progressWidth, labelId: 'Perlu Perhatian' };
    if (hasPaymentDue7Days || budgetUsedPercentage > 75) return { status: 'Looking Good', color: '#84CC16', percentage: progressWidth, labelId: 'Kondisi Baik' };
    
    return { status: 'On Track', color: '#22C55E', percentage: progressWidth, labelId: 'Aman (On Track)' };
  };

  const budgetHealth = getBudgetHealth();

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    await updateBudget(Number(newTarget));
    setShowTargetModal(false);
  };

  const handleAddRow = async () => {
    await addExpense({
      title: language === 'id' ? 'Deskripsi' : 'Description',
      category: 'Lainnya',
      vendor_name: '',
      planned_amount: 0,
      actual_amount: 0,
      paid_amount: 0,
      amount: 0, 
      is_paid: false,
      deadline: null,
      type: 'expense'
    });
  };

  const startEditing = (expense, field) => {
    setEditingCell({ id: expense.id, field });
    
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

    if (['planned_amount', 'actual_amount', 'paid_amount'].includes(field)) {
      finalValue = evaluateMath(editValue);
    }

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

  const toggleFilter = (status) => {
    setFilterStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };



  // Filter & Search & Sort Logic
  const processedData = useMemo(() => {
    let data = validExpenses.filter(e => {
      const searchLower = searchTerm.toLowerCase();
      const matchTitle = (e.title || '').toLowerCase().includes(searchLower);
      const matchVendor = (e.vendor_name || '').toLowerCase().includes(searchLower);
      const matchCat = (e.category || '').toLowerCase().includes(searchLower);
      return matchTitle || matchVendor || matchCat;
    });

    if (filterStatuses.length > 0) {
      data = data.filter(e => {
        const actual = Number(e.actual_amount) || 0;
        const paid = Number(e.paid_amount) || 0;
        const status = getStatus(paid, actual);
        
        return filterStatuses.includes(status);
      });
    }

    return data;
  }, [validExpenses, searchTerm, filterStatuses]);

  return (
    <div className="budget-container">
      <header className="page-header">
        <h1>{t('budget.title')}</h1>
        <p className="subtitle">{t('budget.subtitle')}</p>
      </header>

      {/* Summary Matrix - Redesigned */}
      <div className="budget-matrix">
        <div className="matrix-primary">
          <div className="matrix-card total-budget-card" onClick={() => setShowTargetModal(true)} title={language === 'id' ? 'Klik untuk ubah budget' : 'Click to edit budget'}>
            <div className="card-header">
              <h3>{language === 'id' ? 'Total Budget' : 'Total Budget'}</h3>
              <Edit3 size={16} opacity={0.7} />
            </div>
            <p className="amount">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="matrix-card sisa-budget-card">
            <h3>{language === 'id' ? 'Sisa Budget' : 'Remaining Budget'}</h3>
            <p className="amount">{formatCurrency(sisaBudget)}</p>
          </div>
        </div>
        
        <div className="matrix-secondary">
          <div className="matrix-card rencana-card">
            <h3>{language === 'id' ? 'Rencana Pengeluaran' : 'Planned Expense'}</h3>
            <p className="amount-small">{formatCurrency(rencanaPengeluaran)}</p>
          </div>
          <div className="matrix-card dibayar-card">
            <h3>{language === 'id' ? 'Pembayaran Selesai' : 'Paid Amount'}</h3>
            <p className="amount-small">{formatCurrency(sudahDibayar)}</p>
          </div>
          <div className="matrix-card sisa-bayar-card">
            <h3>{language === 'id' ? 'Sisa Pembayaran' : 'Remaining Payment'}</h3>
            <p className="amount-small">{formatCurrency(totalSisaPembayaran)}</p>
          </div>
        </div>
      </div>

      {/* Budget Health Progress Bar */}
      <div className="budget-health-section">
        <div className="health-header">
          <h4>{language === 'id' ? 'Kesehatan Anggaran' : 'Budget Health'}</h4>
          <span className="health-badge" style={{ backgroundColor: budgetHealth.color }}>
            {language === 'id' ? budgetHealth.labelId : budgetHealth.status}
          </span>
        </div>
        <div className="health-bar-bg">
          <div 
            className="health-bar-fill" 
            style={{ width: `${budgetHealth.percentage}%`, backgroundColor: budgetHealth.color }}
          ></div>
        </div>
      </div>

      {/* Table Section */}
      <div className="budget-table-section">
        <div className="table-toolbar">
          <div className="filter-pills">
            <button className={`filter-pill ${filterStatuses.includes('belum-bayar') ? 'active' : ''}`} onClick={() => toggleFilter('belum-bayar')}>{language === 'id' ? 'Belum Bayar' : 'Unpaid'}</button>
            <button className={`filter-pill ${filterStatuses.includes('cicilan') ? 'active' : ''}`} onClick={() => toggleFilter('cicilan')}>{language === 'id' ? 'Cicilan' : 'Installment'}</button>
            <button className={`filter-pill ${filterStatuses.includes('lunas') ? 'active' : ''}`} onClick={() => toggleFilter('lunas')}>{language === 'id' ? 'Lunas' : 'Paid'}</button>
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
                {columns.map((col, idx) => (
                  <th 
                    key={col.id} 
                    style={{ width: col.width }}
                  >
                    <div className="th-content">
                      {language === 'id' ? col.labelId : col.labelEn}
                    </div>
                  </th>
                ))}
                <th style={{ width: '1%' }}></th>
              </tr>
            </thead>
            <tbody>
              {processedData.map(expense => {
                const actual = Number(expense.actual_amount) || 0;
                const paid = Number(expense.paid_amount) || 0;
                const sisa = Math.max(actual - paid, 0);
                const status = getStatus(paid, actual);
                const isEditing = (field) => editingCell?.id === expense.id && editingCell?.field === field;

                const renderCellContent = (col) => {
                  switch (col.id) {
                    case 'kebutuhan':
                      return (
                        <>
                          {isEditing('category') ? (
                            <>
                              <input 
                                className="editable-select"
                                list="budget-categories"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleBlur(expense)}
                                autoFocus
                                placeholder={language === 'id' ? 'Ketik kategori...' : 'Type category...'}
                              />
                              <datalist id="budget-categories">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{language === 'id' ? cat : (CATEGORY_TRANSLATIONS[cat] || cat)}</option>)}
                              </datalist>
                            </>
                          ) : (
                            <div onClick={() => startEditing(expense, 'category')} className="cell-clickable bold">
                              {expense.category ? (language === 'id' ? expense.category : (CATEGORY_TRANSLATIONS[expense.category] || expense.category)) : (language === 'id' ? 'Ketik kategori...' : 'Type category...')}
                            </div>
                          )}
                          {isEditing('title') ? (
                            <input 
                              type="text" 
                              className="editable-input small-input" 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={() => handleBlur(expense)}
                              onKeyDown={(e) => handleKeyDown(e, expense)}
                              autoFocus
                            />
                          ) : (
                            <div onClick={() => startEditing(expense, 'title')} className="cell-clickable muted">
                              {expense.title || (language === 'id' ? '+ Detail' : '+ Details')}
                            </div>
                          )}
                        </>
                      );
                    case 'vendor_name':
                      return isEditing('vendor_name') ? (
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
                        <div onClick={() => startEditing(expense, 'vendor_name')} className="cell-clickable">
                          {expense.vendor_name || <span className="placeholder-text">{language === 'id' ? 'Tulis...' : 'Write...'}</span>}
                        </div>
                      );
                    case 'planned_amount':
                      return isEditing('planned_amount') ? (
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
                        <span className="amount-text" onClick={() => startEditing(expense, 'planned_amount')}>
                          {formatCurrency(expense.planned_amount)}
                        </span>
                      );
                    case 'actual_amount':
                      return isEditing('actual_amount') ? (
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
                        <span className="amount-text" onClick={() => startEditing(expense, 'actual_amount')}>
                          {formatCurrency(actual)}
                        </span>
                      );
                    case 'paid_amount':
                      return isEditing('paid_amount') ? (
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
                        <span className={`amount-text ${expense.paid_amount > 0 ? 'text-success' : ''}`} onClick={() => startEditing(expense, 'paid_amount')}>
                          {formatCurrency(paid)}
                        </span>
                      );
                    case 'sisa':
                      return (
                        <span className={`amount-text ${sisa > 0 ? 'text-warning' : 'text-muted'}`}>
                          {formatCurrency(sisa)}
                        </span>
                      );
                    case 'deadline':
                      return isEditing('deadline') ? (
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
                        <div onClick={() => startEditing(expense, 'deadline')} className="cell-clickable date-text">
                          {expense.deadline ? new Date(expense.deadline).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="placeholder-text">{language === 'id' ? 'Pilih...' : 'Set...'}</span>}
                        </div>
                      );
                    case 'status':
                      return (
                        <div style={{ textAlign: 'center' }}>
                          <span className={`status-badge ${status}`}>
                            {getStatusText(status, language)}
                          </span>
                        </div>
                      );
                    default:
                      return null;
                  }
                };

                return (
                  <tr key={expense.id}>
                    {columns.map(col => (
                      <td key={col.id} style={{ textAlign: ['planned_amount', 'actual_amount', 'paid_amount', 'sisa'].includes(col.id) ? 'right' : 'left' }}>
                        {renderCellContent(col)}
                      </td>
                    ))}
                    <td>
                      <button onClick={() => deleteExpense(expense.id)} className="btn-icon-danger" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <button className="add-row-btn" onClick={handleAddRow}>
            <Plus size={18} /> {language === 'id' ? 'Tambah Pengeluaran' : 'Add Expense'}
          </button>
        </div>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <button onClick={() => setShowTargetModal(false)} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('budget.editTarget')}</h3>
            <form onSubmit={handleUpdateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{t('budget.targetAmount')} (Rp)</label>
                <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} required className="form-input" />
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
