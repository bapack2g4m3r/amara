import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, X, ArrowUpDown, ArrowUp, ArrowDown, Calendar, ChevronDown, ChevronUp, Edit2, Check, Pencil } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { formatDate } from '../utils/dateFormatter';
import ConfirmModal from '../components/ConfirmModal';
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

const formatShortCurrency = (amount) => {
  const num = Math.abs(amount || 0);
  const sign = (amount || 0) < 0 ? '-' : '';
  if (num >= 1_000_000_000) {
    return `${sign}Rp ${(num / 1_000_000_000).toFixed(1).replace('.0', '')}M`;
  }
  if (num >= 1_000_000) {
    return `${sign}Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  }
  if (num >= 1_000) {
    return `${sign}Rp ${(num / 1_000).toFixed(0)}rb`;
  }
  return `${sign}Rp ${num}`;
};

const formatNumberInput = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const str = String(val).trim();

  // If user is typing math operators like +, -, *, /, preserve raw string so they can type math
  if (/[+\-*/]/.test(str)) {
    return str;
  }

  // Extract all digits
  const clean = str.replace(/\D/g, '');
  if (!clean) return '';

  // Format with thousand separator dot (Indonesian standard)
  return new Intl.NumberFormat('id-ID').format(Number(clean));
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
  'Cincin', 'Mahar', 'Seserahan', 'Wedding Organizer'
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

const CATEGORY_ICONS = {
  'Venue': '🏛️',
  'Catering': '🍽️',
  'Dekorasi': '💐',
  'Attire': '👗',
  'Makeup': '💄',
  'Dokumentasi': '📸',
  'Entertainment': '🎤',
  'Undangan': '💌',
  'Souvenir': '🎁',
  'Cincin': '💍',
  'Mahar': '📜',
  'Seserahan': '🎀',
  'Wedding Organizer': '📋',
  'Lainnya': '✨'
};

const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || '🏷️';
};

// Lightweight SVG Circular Donut Progress Meter
const DonutProgress = ({ percentage = 0, size = 80 }) => {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="donut-chart-container" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          opacity="0.5"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donutGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="donut-center-text" style={{ position: 'absolute', textAlign: 'center' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
          {clampedPct}%
        </span>
      </div>
    </div>
  );
};

const DEFAULT_COLUMNS = [
  { id: 'kebutuhan', labelId: 'Kebutuhan', labelEn: 'Item', width: '15%' },
  { id: 'vendor_name', labelId: 'Vendor', labelEn: 'Vendor', width: '13%' },
  { id: 'planned_amount', labelId: 'Budget', labelEn: 'Budget', width: '11%' },
  { id: 'actual_amount', labelId: 'Aktual', labelEn: 'Actual', width: '11%' },
  { id: 'paid_amount', labelId: 'Dibayar', labelEn: 'Paid', width: '11%' },
  { id: 'sisa', labelId: 'Sisa', labelEn: 'Remaining', width: '11%' },
  { id: 'deadline', labelId: 'Deadline', labelEn: 'Deadline', width: '10%' },
  { id: 'status', labelId: 'Status', labelEn: 'Status', width: '13%' }
];

const Budget = () => {
  const {
    budgets,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    customCategories,
    addCustomCategory,
    updateCustomCategories,
    userRole
  } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const { t, language } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatuses, setFilterStatuses] = useState([]); // Multiple filters
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState(budgets?.total_fund || 0);

  // Custom Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [targetExpenseForCustom, setTargetExpenseForCustom] = useState(null);

  // Mobile View States
  const [expandedCategories, setExpandedCategories] = useState({});
  const [itemModal, setItemModal] = useState({ isOpen: false, mode: 'add', initialData: null });
  const [itemForm, setItemForm] = useState({
    title: '',
    category: 'Venue',
    vendor_name: '',
    planned_amount: '',
    actual_amount: '',
    paid_amount: '',
    deadline: ''
  });

  // Deletion Confirmation States
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (columnId) => {
    setSortConfig(prev => {
      if (prev.key === columnId) {
        if (prev.direction === 'asc') return { key: columnId, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Columns
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  // Editable fields state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const totalBudget = budgets?.total_fund || 0;

  const validExpenses = expenses.filter(e => e.type !== 'income');

  // Combined standard and custom categories
  const allCategories = useMemo(() => {
    const list = [...CATEGORIES];
    (customCategories || []).forEach(cat => {
      if (!list.includes(cat)) list.push(cat);
    });
    return list;
  }, [customCategories]);

  const displayCategory = (cat) => {
    if (!cat) return '';
    return language === 'id' ? cat : (CATEGORY_TRANSLATIONS[cat] || cat);
  };

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
  const sisaEstimasi = totalBudget - rencanaPengeluaran;
  const percentRealized = totalBudget > 0 ? Math.min(Math.round((sudahDibayar / totalBudget) * 100), 100) : 0;

  // Category stats grouping for Mobile Accordion
  const categoryStats = useMemo(() => {
    const map = {};
    allCategories.forEach(cat => {
      map[cat] = {
        name: cat,
        items: [],
        planned: 0,
        actual: 0,
        paid: 0,
        sisa: 0
      };
    });

    validExpenses.forEach(item => {
      const cat = item.category || 'Venue';
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          items: [],
          planned: 0,
          actual: 0,
          paid: 0,
          sisa: 0
        };
      }
      const planned = Number(item.planned_amount) || 0;
      const actual = Number(item.actual_amount) || 0;
      const paid = Number(item.paid_amount) || 0;
      const sisa = Math.max(actual - paid, 0);

      map[cat].items.push(item);
      map[cat].planned += planned;
      map[cat].actual += actual;
      map[cat].paid += paid;
      map[cat].sisa += sisa;
    });

    return map;
  }, [allCategories, validExpenses]);

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const openAddItemModal = (cat) => {
    if (isReadOnly) return;
    setItemForm({
      title: '',
      category: cat || CATEGORIES[0] || 'Venue',
      vendor_name: '',
      planned_amount: '',
      actual_amount: '',
      paid_amount: '',
      deadline: ''
    });
    setItemModal({ isOpen: true, mode: 'add', initialData: null });
  };

  const openEditItemModal = (item) => {
    if (isReadOnly) return;
    setItemForm({
      id: item.id,
      title: item.title || '',
      category: item.category || CATEGORIES[0] || 'Venue',
      vendor_name: item.vendor_name || '',
      planned_amount: formatNumberInput(item.planned_amount),
      actual_amount: formatNumberInput(item.actual_amount),
      paid_amount: formatNumberInput(item.paid_amount),
      deadline: item.deadline || ''
    });
    setItemModal({ isOpen: true, mode: 'edit', initialData: item });
  };

  const handleSaveItemModal = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const title = itemForm.title.trim();
    if (!title) return;

    const planned = evaluateMath(itemForm.planned_amount);
    const actual = evaluateMath(itemForm.actual_amount);
    const paid = evaluateMath(itemForm.paid_amount);

    const payload = {
      title,
      category: itemForm.category || 'Venue',
      vendor_name: (itemForm.vendor_name || '').trim(),
      planned_amount: planned,
      actual_amount: actual,
      paid_amount: paid,
      amount: actual,
      is_paid: paid >= actual && actual > 0,
      deadline: itemForm.deadline || null,
      type: 'expense'
    };

    if (itemModal.mode === 'edit' && itemForm.id) {
      await updateExpense(itemForm.id, payload);
    } else {
      await addExpense(payload);
      if (itemForm.category) {
        setExpandedCategories(prev => ({ ...prev, [itemForm.category]: true }));
      }
    }

    setItemModal({ isOpen: false, mode: 'add', initialData: null });
  };

  // Budget Health logic
  const getBudgetHealth = () => {
    if (totalBudget === 0) return { status: 'No Budget Set', color: '#9CA3AF', percentage: 0 };

    let hasLatePayment = false;
    let hasPaymentDue3Days = false;
    let hasPaymentDue7Days = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    validExpenses.forEach(e => {
      const actual = Number(e.actual_amount) || 0;
      const paid = Number(e.paid_amount) || 0;
      const sisa = actual - paid;

      if (sisa > 0 && e.deadline) {
        const dl = new Date(e.deadline);
        dl.setHours(0, 0, 0, 0);
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

    if (hasLatePayment && overBudgetPercentage > 10) return { status: 'Critical', color: '#EF4444', bg: '#FEE2E2', textColor: '#DC2626', percentage: progressWidth, labelId: 'KRITIS' };
    if (hasLatePayment || overBudgetPercentage > 0) return { status: 'Action Required', color: '#F97316', bg: '#FFEDD5', textColor: '#EA580C', percentage: progressWidth, labelId: 'PERLU TINDAKAN' };
    if (hasPaymentDue3Days) return { status: 'Needs Attention', color: '#EAB308', bg: '#FEF9C3', textColor: '#CA8A04', percentage: progressWidth, labelId: 'PERLU PERHATIAN' };
    if (hasPaymentDue7Days || budgetUsedPercentage > 75) return { status: 'Looking Good', color: '#84CC16', bg: '#ECFCCB', textColor: '#65A30D', percentage: progressWidth, labelId: 'KONDISI BAIK' };

    return { status: 'On Track', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', textColor: 'var(--color-primary)', percentage: progressWidth, labelId: 'AMAN (ON TRACK)' };
  };

  const budgetHealth = getBudgetHealth();

  const openTargetModal = () => {
    if (isReadOnly) return;
    setNewTarget(formatNumberInput(totalBudget));
    setShowTargetModal(true);
  };

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    await updateBudget(evaluateMath(newTarget));
    setShowTargetModal(false);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    addCustomCategory(trimmed);
    if (targetExpenseForCustom) {
      await updateExpense(targetExpenseForCustom.id, { category: trimmed });
    }
    setNewCategoryName('');
  };

  const handleDeleteCustomCategory = async (catToDelete) => {
    const updated = (customCategories || []).filter(c => c !== catToDelete);
    updateCustomCategories(updated);

    // Update any expense that used this category back to the first default category
    const fallbackCat = CATEGORIES[0] || 'Venue';
    const affected = validExpenses.filter(e => e.category === catToDelete);
    for (const exp of affected) {
      await updateExpense(exp.id, { category: fallbackCat });
    }
  };

  const handleAddRow = async () => {
    await addExpense({
      title: language === 'id' ? 'Deskripsi' : 'Description',
      category: CATEGORIES[0] || 'Venue',
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
    if (isReadOnly) return;
    setEditingCell({ id: expense.id, field });

    if (field === 'title') setEditValue(expense.title || '');
    else if (field === 'category') setEditValue(expense.category || CATEGORIES[0] || 'Venue');
    else if (field === 'vendor_name') setEditValue(expense.vendor_name || '');
    else if (field === 'deadline') setEditValue(expense.deadline || '');
    else if (field === 'planned_amount') setEditValue(formatNumberInput(expense.planned_amount));
    else if (field === 'actual_amount') setEditValue(formatNumberInput(expense.actual_amount));
    else if (field === 'paid_amount') setEditValue(formatNumberInput(expense.paid_amount));
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

    // Sort Logic
    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      const multiplier = direction === 'asc' ? 1 : -1;

      data = [...data].sort((a, b) => {
        if (key === 'kebutuhan') {
          const catA = (a.category || '').toLowerCase();
          const catB = (b.category || '').toLowerCase();
          if (catA !== catB) return catA.localeCompare(catB) * multiplier;
          return (a.title || '').localeCompare(b.title || '') * multiplier;
        }

        if (key === 'vendor_name') {
          const vA = (a.vendor_name || '').toLowerCase();
          const vB = (b.vendor_name || '').toLowerCase();
          return vA.localeCompare(vB) * multiplier;
        }

        if (['planned_amount', 'actual_amount', 'paid_amount'].includes(key)) {
          const numA = Number(a[key]) || 0;
          const numB = Number(b[key]) || 0;
          return (numA - numB) * multiplier;
        }

        if (key === 'sisa') {
          const sisaA = Math.max((Number(a.actual_amount) || 0) - (Number(a.paid_amount) || 0), 0);
          const sisaB = Math.max((Number(b.actual_amount) || 0) - (Number(b.paid_amount) || 0), 0);
          return (sisaA - sisaB) * multiplier;
        }

        if (key === 'deadline') {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return (new Date(a.deadline) - new Date(b.deadline)) * multiplier;
        }

        if (key === 'status') {
          const statusOrder = { 'belum-bayar': 0, 'cicilan': 1, 'lunas': 2 };
          const sA = getStatus(Number(a.paid_amount) || 0, Number(a.actual_amount) || 0);
          const sB = getStatus(Number(b.paid_amount) || 0, Number(b.actual_amount) || 0);
          return ((statusOrder[sA] ?? 0) - (statusOrder[sB] ?? 0)) * multiplier;
        }

        return 0;
      });
    }

    return data;
  }, [validExpenses, searchTerm, filterStatuses, sortConfig]);

  return (
    <div className="budget-container">
      <header className="page-header">
        <div>
          <h1>{t('budget.title')}</h1>
          <p className="subtitle">{t('budget.subtitle')}</p>
        </div>
      </header>

      {/* Summary Matrix - Redesigned */}
      <div className="budget-matrix">
        <div className="matrix-primary">
          <div className="matrix-card total-budget-card" onClick={openTargetModal} title={isReadOnly ? (language === 'id' ? 'Akses Lihat Saja' : 'View Only Access') : (language === 'id' ? 'Klik untuk ubah budget' : 'Click to edit budget')} style={isReadOnly ? { cursor: 'default' } : {}}>
            <div className="card-header">
              <h3>{language === 'id' ? 'Total Budget' : 'Total Budget'}</h3>
              {!isReadOnly && <Edit3 size={16} opacity={0.7} />}
            </div>
            <p className="amount">{formatCurrency(totalBudget)}</p>
          </div>
          <div className={`matrix-card sisa-budget-card ${sisaBudget < 0 ? 'deficit' : ''}`}>
            <div className="card-header">
              <h3>{language === 'id' ? 'Sisa Budget' : 'Remaining Budget'}</h3>
            </div>
            <p className={`amount ${sisaBudget < 0 ? 'text-danger' : ''}`}>
              {formatCurrency(sisaBudget)}
            </p>
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
          <span className="health-badge" style={{ backgroundColor: budgetHealth.bg, color: budgetHealth.textColor }}>
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

        <div className="table-container budget-desktop-table">
          <table className="budget-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.id)}
                    className={`th-sortable ${sortConfig.key === col.id ? 'sorted' : ''}`}
                    title={language === 'id' ? `Klik untuk urutkan berdasarkan ${col.labelId}` : `Click to sort by ${col.labelEn}`}
                  >
                    <div className="th-content">
                      <span>{language === 'id' ? col.labelId : col.labelEn}</span>
                      <span className="th-sort-icon">
                        {sortConfig.key === col.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp size={12} className="sort-icon-active" />
                          ) : (
                            <ArrowDown size={12} className="sort-icon-active" />
                          )
                        ) : (
                          <ArrowUpDown size={11} className="sort-icon-idle" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
                <th style={{ width: '5%', textAlign: 'center' }}></th>
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
                        <div className="kebutuhan-cell">
                          <select
                            className="category-dropdown-select"
                            value={expense.category || CATEGORIES[0] || 'Venue'}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                setTargetExpenseForCustom(expense);
                                setShowCategoryModal(true);
                              } else {
                                updateExpense(expense.id, { category: e.target.value });
                              }
                            }}
                          >
                            {allCategories.map(cat => (
                              <option key={cat} value={cat}>
                                {getCategoryIcon(cat)} {language === 'id' ? cat : (CATEGORY_TRANSLATIONS[cat] || cat)}
                              </option>
                            ))}
                            {!isReadOnly && (
                              <>
                                <option disabled value="">──────────</option>
                                <option value="__add_new__" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                  {language === 'id' ? '+ Tambah Kategori Baru...' : '+ Add New Category...'}
                                </option>
                              </>
                            )}
                          </select>
                          {isEditing('title') ? (
                            <input
                              type="text"
                              className="editable-input small-input"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={() => handleBlur(expense)}
                              onKeyDown={(e) => handleKeyDown(e, expense)}
                              autoFocus
                              placeholder={language === 'id' ? 'Tulis detail...' : 'Write detail...'}
                            />
                          ) : (
                            <div onClick={() => startEditing(expense, 'title')} className="cell-clickable muted">
                              {expense.title || (language === 'id' ? '+ Detail' : '+ Details')}
                            </div>
                          )}
                        </div>
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
                          onChange={e => setEditValue(formatNumberInput(e.target.value))}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          placeholder="0"
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
                          onChange={e => setEditValue(formatNumberInput(e.target.value))}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          placeholder="0"
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
                          onChange={e => setEditValue(formatNumberInput(e.target.value))}
                          onBlur={() => handleBlur(expense)}
                          onKeyDown={(e) => handleKeyDown(e, expense)}
                          autoFocus
                          placeholder="0"
                        />
                      ) : (
                        <span className={`amount-text ${expense.paid_amount > 0 ? 'text-success' : ''}`} onClick={() => startEditing(expense, 'paid_amount')}>
                          {formatCurrency(paid)}
                        </span>
                      );
                    case 'sisa':
                      return (
                        <span className={`amount-text ${sisa > 0 ? 'text-warning' : ''}`} style={{ color: sisa === 0 ? 'var(--color-text)' : undefined }}>
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
                          {expense.deadline ? formatDate(expense.deadline) : <span className="placeholder-text">{language === 'id' ? 'Pilih...' : 'Set...'}</span>}
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
                    <td style={{ textAlign: 'center' }} className="table-action-cell">
                      {!isReadOnly && (
                        <button
                          onClick={() => setDeletingExpense(expense)}
                          className="btn-icon-danger"
                          title={language === 'id' ? 'Hapus kebutuhan' : 'Delete item'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!isReadOnly && (
            <button className="add-row-btn" onClick={handleAddRow}>
              <Plus size={18} /> {language === 'id' ? 'Tambah Pengeluaran' : 'Add Expense'}
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE VIEW: Matching Competitor Simple, Elegant & User-Friendly Layout --- */}
      <div className="budget-mobile-container">
        {/* 1. Top Donut Card */}
        <div className="bm-donut-card">
          <div className="bm-donut-left">
            <DonutProgress percentage={percentRealized} size={84} />
          </div>
          <div className="bm-donut-right">
            <h2 className="bm-donut-realisasi">{formatShortCurrency(sudahDibayar)}</h2>
            <p className="bm-donut-subline">
              {language === 'id' ? 'realisasi dari' : 'realized of'}{' '}
              <strong>{formatCurrency(totalBudget)}</strong>
              {!isReadOnly && (
                <button
                  type="button"
                  className="bm-donut-edit-chip"
                  onClick={openTargetModal}
                  title={language === 'id' ? 'Ubah Target Budget' : 'Edit Target Budget'}
                >
                  <Pencil size={11} /> {language === 'id' ? 'Ubah' : 'Edit'}
                </button>
              )}
            </p>
            <div className="bm-donut-bullets">
              <span className="bm-bullet est">
                <span className="bm-dot est-dot"></span>
                Est. {formatShortCurrency(rencanaPengeluaran)}
              </span>
              <span className="bm-bullet sisa">
                <span className="bm-dot sisa-dot"></span>
                Sisa {formatShortCurrency(sisaBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Quick Stats Numbers */}
        <div className="bm-quick-stats">
          <div
            className={`bm-stat-col ${!isReadOnly ? 'bm-stat-col-interactive' : ''}`}
            onClick={openTargetModal}
            role={!isReadOnly ? 'button' : undefined}
            tabIndex={!isReadOnly ? 0 : undefined}
            title={!isReadOnly ? (language === 'id' ? 'Klik untuk ubah Total Budget' : 'Click to edit Total Budget') : undefined}
          >
            <span className="bm-stat-val">{formatShortCurrency(totalBudget)}</span>
            <span className="bm-stat-lbl">
              Total Budget
              {!isReadOnly && (
                <span className="bm-stat-edit-pill">
                  <Pencil size={10} /> {language === 'id' ? 'Ubah' : 'Edit'}
                </span>
              )}
            </span>
          </div>
          <div className="bm-stat-col">
            <span className="bm-stat-val">{formatShortCurrency(rencanaPengeluaran)}</span>
            <span className="bm-stat-lbl">Estimasi</span>
          </div>
          <div className="bm-stat-col">
            <span className={`bm-stat-val ${sisaEstimasi < 0 ? 'deficit' : 'surplus'}`}>
              {formatShortCurrency(sisaEstimasi)}
            </span>
            <span className="bm-stat-lbl">Sisa Est.</span>
          </div>
        </div>

        {/* 3. Category Accordion List (Unified 1-Column Mobile View) */}
        <div className="bm-categories-list">
          {allCategories.map(cat => {
            const stats = categoryStats[cat] || { planned: 0, paid: 0, actual: 0, items: [] };
            const isExpanded = !!expandedCategories[cat];
            const isCustom = !CATEGORIES.includes(cat);

            return (
              <div className={`bm-category-card ${isExpanded ? 'expanded' : ''}`} key={cat}>
                {/* Card Header (Accordion Trigger) */}
                <div
                  className="bm-cat-header"
                  onClick={() => toggleCategoryExpand(cat)}
                >
                  <div className="bm-cat-left">
                    <div className="bm-cat-icon">
                      {getCategoryIcon(cat)}
                    </div>
                    <div className="bm-cat-info">
                      <h4 className="bm-cat-title">{displayCategory(cat)}</h4>
                      <p className="bm-cat-meta">
                        Est. {formatShortCurrency(stats.planned)} • Realisasi {formatShortCurrency(stats.paid)} • {stats.items.length} item
                      </p>
                    </div>
                  </div>

                  <div className="bm-cat-right">
                    {!isReadOnly && (
                      <button
                        type="button"
                        className="bm-cat-btn-add"
                        title={language === 'id' ? 'Tambah kebutuhan' : 'Add item'}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddItemModal(cat);
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {isCustom && !isReadOnly && (
                      <button
                        type="button"
                        className="bm-cat-btn-del"
                        title={language === 'id' ? 'Hapus kategori' : 'Delete category'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCategory(cat);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="bm-cat-chevron">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="bm-cat-content">
                    {stats.items.length === 0 ? (
                      <div className="bm-cat-empty">
                        <p>{language === 'id' ? 'Belum ada item kebutuhan di kategori ini.' : 'No items in this category yet.'}</p>
                        {!isReadOnly && (
                          <button
                            type="button"
                            className="bm-btn-add-item-empty"
                            onClick={() => openAddItemModal(cat)}
                          >
                            <Plus size={14} /> {language === 'id' ? 'Tambah Kebutuhan Pertama' : 'Add First Item'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bm-cat-items">
                        {stats.items.map(item => {
                          const status = getStatus(item.paid_amount, item.actual_amount);
                          return (
                            <div className="bm-item-row" key={item.id}>
                              <div className="bm-item-top">
                                <div className="bm-item-main">
                                  <span className="bm-item-name">{item.title}</span>
                                  {item.vendor_name && (
                                    <span className="bm-item-vendor">🏢 {item.vendor_name}</span>
                                  )}
                                </div>
                                <span className={`status-badge ${status}`}>
                                  {getStatusText(status, language)}
                                </span>
                              </div>

                              <div className="bm-item-numbers">
                                <div className="bm-num-item">
                                  <span className="bm-num-lbl">{language === 'id' ? 'Rencana' : 'Budget'}</span>
                                  <span className="bm-num-val">{formatCurrency(item.planned_amount)}</span>
                                </div>
                                <div className="bm-num-item">
                                  <span className="bm-num-lbl">{language === 'id' ? 'Aktual' : 'Actual'}</span>
                                  <span className="bm-num-val">{formatCurrency(item.actual_amount)}</span>
                                </div>
                                <div className="bm-num-item">
                                  <span className="bm-num-lbl">{language === 'id' ? 'Dibayar' : 'Paid'}</span>
                                  <span className="bm-num-val highlight">{formatCurrency(item.paid_amount)}</span>
                                </div>
                              </div>

                              {!isReadOnly && (
                                <div className="bm-item-footer">
                                  <button
                                    type="button"
                                    className="bm-item-act-btn"
                                    onClick={() => openEditItemModal(item)}
                                  >
                                    <Edit2 size={13} />
                                    <span>{language === 'id' ? 'Edit' : 'Edit'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="bm-item-act-btn danger"
                                    onClick={() => setDeletingExpense(item)}
                                  >
                                    <Trash2 size={13} />
                                    <span>{language === 'id' ? 'Hapus' : 'Delete'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!isReadOnly && (
                          <button
                            type="button"
                            className="bm-cat-add-btn"
                            onClick={() => openAddItemModal(cat)}
                          >
                            <Plus size={14} /> {language === 'id' ? `Tambah Kebutuhan di ${displayCategory(cat)}` : `Add Item in ${displayCategory(cat)}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add New Category Button */}
          {!isReadOnly && (
            <button
              type="button"
              className="bm-btn-manage-cat"
              onClick={() => setShowCategoryModal(true)}
            >
              <Plus size={16} />
              <span>{language === 'id' ? 'Tambah / Kelola Kategori Baru' : 'Add / Manage New Category'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <button onClick={() => setShowTargetModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>{t('budget.editTarget')}</h3>
            <form onSubmit={handleUpdateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{t('budget.targetAmount')} (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newTarget}
                  onChange={e => setNewTarget(formatNumberInput(e.target.value))}
                  required
                  className="form-input"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Custom Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '440px', width: '90%' }}>
            <button onClick={() => { setShowCategoryModal(false); setTargetExpenseForCustom(null); }} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '6px' }}>
              {language === 'id' ? 'Kelola Kategori Kebutuhan' : 'Manage Categories'}
            </h3>
            <p className="subtitle" style={{ fontSize: '0.82rem', marginBottom: '16px' }}>
              {language === 'id' ? 'Tambah kategori baru atau hapus kategori kustom yang tidak diperlukan.' : 'Add new categories or delete custom ones as needed.'}
            </p>

            {/* Form Tambah Kategori */}
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                required
                placeholder={language === 'id' ? 'Kategori baru (cth: Bulan Madu)...' : 'New category (e.g. Honeymoon)...'}
                className="form-input"
                style={{ flex: 1, fontSize: '0.88rem' }}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} />
                <span>{language === 'id' ? 'Tambah' : 'Add'}</span>
              </button>
            </form>

            {/* List Kategori Kustom dengan Tombol Hapus */}
            <div className="custom-categories-section">
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                {language === 'id' ? 'Kategori Kustom Anda' : 'Your Custom Categories'}
              </h4>
              {customCategories && customCategories.length > 0 ? (
                <div className="custom-categories-list">
                  {customCategories.map(cat => (
                    <div key={cat} className="custom-category-item">
                      <span className="custom-category-name">{getCategoryIcon(cat)} {cat}</span>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        className="btn-icon-danger-small"
                        title={language === 'id' ? `Hapus kategori "${cat}"` : `Delete "${cat}"`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '8px 0 16px 0' }}>
                  {language === 'id' ? 'Belum ada kategori kustom tambahan.' : 'No custom categories yet.'}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <button type="button" onClick={() => { setShowCategoryModal(false); setTargetExpenseForCustom(null); }} className="btn-secondary" style={{ padding: '8px 20px' }}>
                {language === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Expense Deletion */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => {
          if (!isDeleting) setDeletingExpense(null);
        }}
        onConfirm={async () => {
          if (!deletingExpense) return;
          try {
            setIsDeleting(true);
            await deleteExpense(deletingExpense.id);
            setDeletingExpense(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus item kebutuhan ini?' : 'Delete this item?'}
        message={language === 'id' ? 'Item kebutuhan yang dihapus tidak dapat dikembalikan.' : 'Deleted items cannot be recovered.'}
        itemName={deletingExpense ? `${deletingExpense.category ? (language === 'id' ? deletingExpense.category : (CATEGORY_TRANSLATIONS[deletingExpense.category] || deletingExpense.category)) : ''}${deletingExpense.title ? ` - ${deletingExpense.title}` : ''}` : ''}
        confirmText={language === 'id' ? 'Hapus' : 'Delete'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />

      {/* Confirmation Modal for Custom Category Deletion */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => {
          if (!isDeleting) setDeletingCategory(null);
        }}
        onConfirm={async () => {
          if (!deletingCategory) return;
          try {
            setIsDeleting(true);
            await handleDeleteCustomCategory(deletingCategory);
            setDeletingCategory(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus kategori ini?' : 'Delete this category?'}
        message={language === 'id' ? `Semua pengeluaran dengan kategori ini akan dialihkan ke "${CATEGORIES[0] || 'Venue'}".` : `All expenses with this category will be changed to "${CATEGORIES[0] || 'Venue'}".`}
        itemName={deletingCategory || ''}
        confirmText={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />

      {/* Add / Edit Expense Item Modal */}
      {itemModal.isOpen && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '480px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              type="button"
              onClick={() => setItemModal({ isOpen: false, mode: 'add', initialData: null })}
              className="modal-close"
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '4px' }}>
              {itemModal.mode === 'edit'
                ? (language === 'id' ? 'Edit Kebutuhan' : 'Edit Expense')
                : (language === 'id' ? 'Tambah Kebutuhan Baru' : 'Add New Expense')}
            </h3>
            <p className="subtitle" style={{ fontSize: '0.82rem', marginBottom: '18px' }}>
              {language === 'id'
                ? 'Isi rincian kebutuhan anggaran dan pembayaran pernikahan Anda.'
                : 'Fill in your wedding budget item and payment details.'}
            </p>

            <form onSubmit={handleSaveItemModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">{language === 'id' ? 'Nama Kebutuhan' : 'Item Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'id' ? 'Contoh: Sewa Gedung, Paket Catering 500 Pax' : 'e.g. Venue Rental'}
                  value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">{language === 'id' ? 'Kategori' : 'Category'} *</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="form-input"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {getCategoryIcon(cat)} {displayCategory(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{language === 'id' ? 'Vendor (Opsional)' : 'Vendor (Optional)'}</label>
                  <input
                    type="text"
                    placeholder={language === 'id' ? 'Nama Vendor' : 'Vendor Name'}
                    value={itemForm.vendor_name}
                    onChange={e => setItemForm({ ...itemForm, vendor_name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>{language === 'id' ? 'Rencana (Rp)' : 'Planned (Rp)'}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={itemForm.planned_amount}
                    onChange={e => setItemForm({ ...itemForm, planned_amount: formatNumberInput(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>{language === 'id' ? 'Aktual (Rp)' : 'Actual (Rp)'}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={itemForm.actual_amount}
                    onChange={e => setItemForm({ ...itemForm, actual_amount: formatNumberInput(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>{language === 'id' ? 'Dibayar (Rp)' : 'Paid (Rp)'}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={itemForm.paid_amount}
                    onChange={e => setItemForm({ ...itemForm, paid_amount: formatNumberInput(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">{language === 'id' ? 'Jatuh Tempo (Opsional)' : 'Deadline (Optional)'}</label>
                <input
                  type="date"
                  value={itemForm.deadline}
                  onChange={e => setItemForm({ ...itemForm, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, mode: 'add', initialData: null })}
                  className="btn-secondary"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} />
                  <span>{language === 'id' ? 'Simpan' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
