import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Edit2, Check, Copy, Printer, BarChart2 } from 'lucide-react';
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

  if (/[+\-*/]/.test(str)) {
    return str;
  }

  const clean = str.replace(/\D/g, '');
  if (!clean) return '';

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

const DEFAULT_COLUMNS_PEMBAYARAN = [
  { id: 'kebutuhan', labelId: 'Kebutuhan', labelEn: 'Item', width: '22%' },
  { id: 'vendor_name', labelId: 'Vendor', labelEn: 'Vendor', width: '16%' },
  { id: 'actual_amount', labelId: 'Aktual', labelEn: 'Actual', width: '14%' },
  { id: 'paid_amount', labelId: 'Dibayar', labelEn: 'Paid', width: '14%' },
  { id: 'sisa', labelId: 'Sisa', labelEn: 'Remaining', width: '14%' },
  { id: 'deadline', labelId: 'Deadline', labelEn: 'Deadline', width: '10%' },
  { id: 'status', labelId: 'Status', labelEn: 'Status', width: '10%' }
];

const Budget = () => {
  const {
    budgets,
    expenses,
    savings,
    budgetPlans,
    activePlanId,
    addExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    addSavings,
    updateSavings,
    deleteSavings,
    initSavings,
    initBudgetPlans,
    addBudgetPlan,
    duplicateBudgetPlan,
    renameBudgetPlan,
    updateBudgetPlanTarget,
    deleteBudgetPlan,
    setActivePlanId,
    customCategories,
    addCustomCategory,
    userRole,
    profile
  } = useWeddingStore();

  const isReadOnly = userRole === 'viewer';
  const { t, language } = useTranslation();

  // Active Sub-Section Tab: 'budgeting' | 'dana-nikah' | 'pembayaran'
  const [activeTab, setActiveTab] = useState('budgeting');

  // Compare Plans Drawer Toggle
  const [showComparePlans, setShowComparePlans] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatuses, setFilterStatuses] = useState([]);

  // Modals
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState(budgets?.total_fund || 100000000);

  // Add Plan Modal
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanNameInput, setNewPlanNameInput] = useState('');

  // Rename Plan Modal
  const [renamingPlan, setRenamingPlan] = useState(null);
  const [renamePlanInput, setRenamePlanInput] = useState('');

  // Add Custom Category Modal
  const [addCategoryModal, setAddCategoryModal] = useState({ isOpen: false, targetExpenseId: null, fromItemForm: false });
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const handleCategorySelectChange = (e, expenseId) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setAddCategoryModal({ isOpen: true, targetExpenseId: expenseId, fromItemForm: false });
    } else {
      updateExpense(expenseId, { category: val });
    }
  };

  const handleFormCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setAddCategoryModal({ isOpen: true, targetExpenseId: null, fromItemForm: true });
    } else {
      setItemForm(prev => ({ ...prev, category: val }));
    }
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    addCustomCategory(trimmed);

    if (addCategoryModal.targetExpenseId) {
      updateExpense(addCategoryModal.targetExpenseId, { category: trimmed });
    } else if (addCategoryModal.fromItemForm) {
      setItemForm(prev => ({ ...prev, category: trimmed }));
    }

    setNewCategoryInput('');
    setAddCategoryModal({ isOpen: false, targetExpenseId: null, fromItemForm: false });
  };

  // Dana Nikah Savings Modal
  const [savingsModal, setSavingsModal] = useState({ isOpen: false, mode: 'add', initialData: null });
  const [savingsForm, setSavingsForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source_category: ''
  });

  // Mobile Accordion
  const [expandedCategories, setExpandedCategories] = useState({});

  // Add / Edit Expense Item Modal
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

  // Confirm Delete States
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deletingSavings, setDeletingSavings] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Editable Cells in Table
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (initSavings) initSavings();
    if (initBudgetPlans) initBudgetPlans();
  }, []);

  const totalBudget = budgets?.total_fund || 100000000;
  const validExpenses = useMemo(() => expenses.filter(e => e.type !== 'income'), [expenses]);

  const currentPlans = useMemo(() => {
    if (budgetPlans && budgetPlans.length > 0) return budgetPlans;
    return [{ id: 'plan_a', name: 'Plan A' }, { id: 'plan_b', name: 'Plan B' }];
  }, [budgetPlans]);

  const activePlanObj = useMemo(() => {
    return currentPlans.find(p => p.id === activePlanId) || currentPlans[0] || { id: 'plan_a', name: 'Plan A' };
  }, [currentPlans, activePlanId]);

  // Expenses belonging specifically to active plan
  const activePlanExpenses = useMemo(() => {
    return validExpenses.filter(e => (e.plan_id || 'plan_a') === activePlanObj.id);
  }, [validExpenses, activePlanObj.id]);

  // Sum of item planned amounts for currently active plan
  const totalActivePlanAmount = useMemo(() => {
    return activePlanExpenses.reduce((acc, curr) => acc + (Number(curr.planned_amount) || 0), 0);
  }, [activePlanExpenses]);

  // % Terpakai (Estimasi Biaya vs Target Budget)
  const percentTerpakai = useMemo(() => {
    if (totalBudget <= 0) return 0;
    return Math.min(Math.round((totalActivePlanAmount / totalBudget) * 100), 100);
  }, [totalActivePlanAmount, totalBudget]);

  // Plan Totals Map for comparison feature
  const planTotalsMap = useMemo(() => {
    const map = {};
    currentPlans.forEach(p => {
      map[p.id] = validExpenses
        .filter(e => (e.plan_id || 'plan_a') === p.id)
        .reduce((acc, curr) => acc + (Number(curr.planned_amount) || 0), 0);
    });
    return map;
  }, [currentPlans, validExpenses]);

  const handleDuplicateActivePlan = () => {
    if (isReadOnly || !activePlanObj) return;
    duplicateBudgetPlan(activePlanObj.id);
  };

  const handlePrintBudget = () => {
    window.print();
  };

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

  const sudahDibayar = useMemo(() => {
    return validExpenses.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  }, [validExpenses]);

  const totalSisaPembayaran = useMemo(() => {
    return validExpenses.reduce((acc, curr) => {
      const actual = Number(curr.actual_amount) || 0;
      const paid = Number(curr.paid_amount) || 0;
      const sisa = actual - paid;
      return acc + (sisa > 0 ? sisa : 0);
    }, 0);
  }, [validExpenses]);

  const totalAktual = sudahDibayar + totalSisaPembayaran;
  const sisaBudget = totalBudget - totalAktual;

  // Dana Nikah Calculations
  const totalDanaTerkumpul = useMemo(() => {
    return (savings || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [savings]);

  const percentDanaTerkumpul = totalBudget > 0 ? Math.min(Math.round((totalDanaTerkumpul / totalBudget) * 100), 100) : 0;

  const rataRataPerBulan = useMemo(() => {
    if (!savings || savings.length === 0) return 0;

    const dates = savings.map(s => new Date(s.date || Date.now())).filter(d => !isNaN(d));
    if (dates.length === 0) return Math.round(totalDanaTerkumpul / Math.max(savings.length, 1));

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date();

    const months = Math.max(
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1,
      1
    );

    return Math.round(totalDanaTerkumpul / months);
  }, [savings, totalDanaTerkumpul]);

  const rekomendasiPerBulan = useMemo(() => {
    const today = new Date();
    const weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : new Date('2026-12-31');
    const monthsLeft = Math.max(
      (weddingDate.getFullYear() - today.getFullYear()) * 12 + (weddingDate.getMonth() - today.getMonth()),
      1
    );
    const sisaTarget = Math.max(totalBudget - totalDanaTerkumpul, 0);
    return Math.round(sisaTarget / monthsLeft);
  }, [totalBudget, totalDanaTerkumpul, profile?.wedding_date]);

  // Budget Health logic
  const getBudgetHealth = () => {
    if (totalBudget === 0) return { status: 'No Budget Set', color: '#9CA3AF', bg: '#F3F4F6', textColor: '#4B5563', percentage: 0, labelId: 'BELUM DIATUR' };

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
    const progressWidth = Math.min(budgetUsedPercentage, 100);

    if (hasLatePayment && overBudgetPercentage > 10) return { status: 'Critical', color: '#EF4444', bg: '#FEE2E2', textColor: '#DC2626', percentage: progressWidth, labelId: 'KRITIS' };
    if (hasLatePayment || overBudgetPercentage > 0) return { status: 'Action Required', color: '#F97316', bg: '#FFEDD5', textColor: '#EA580C', percentage: progressWidth, labelId: 'PERLU TINDAKAN' };
    if (hasPaymentDue3Days) return { status: 'Needs Attention', color: '#EAB308', bg: '#FEF9C3', textColor: '#CA8A04', percentage: progressWidth, labelId: 'PERLU PERHATIAN' };

    return { status: 'On Track', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', textColor: 'var(--color-primary)', percentage: progressWidth, labelId: 'AMAN (ON TRACK)' };
  };

  const budgetHealth = getBudgetHealth();

  // Sorting
  const handleSort = (columnId) => {
    setSortConfig(prev => {
      if (prev.key === columnId) {
        if (prev.direction === 'asc') return { key: columnId, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Target Modal
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

  // Add Plan Handler
  const handleCreateNewPlan = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    addBudgetPlan(newPlanNameInput);
    setNewPlanNameInput('');
    setShowAddPlanModal(false);
  };

  // Rename Plan Handler
  const handleRenamePlan = (e) => {
    e.preventDefault();
    if (isReadOnly || !renamingPlan) return;
    renameBudgetPlan(renamingPlan.id, renamePlanInput);
    setRenamingPlan(null);
    setRenamePlanInput('');
  };

  // Savings Modal Handlers
  const openAddSavingsModal = () => {
    if (isReadOnly) return;
    setSavingsForm({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      source_category: ''
    });
    setSavingsModal({ isOpen: true, mode: 'add', initialData: null });
  };

  const openEditSavingsModal = (item) => {
    if (isReadOnly) return;
    setSavingsForm({
      id: item.id,
      title: item.title || '',
      amount: formatNumberInput(item.amount),
      date: item.date || new Date().toISOString().split('T')[0],
      source_category: item.source_category || ''
    });
    setSavingsModal({ isOpen: true, mode: 'edit', initialData: item });
  };

  const handleSaveSavingsModal = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const title = savingsForm.title.trim();
    if (!title) return;

    const amt = evaluateMath(savingsForm.amount);
    const payload = {
      title,
      amount: amt,
      date: savingsForm.date,
      source_category: savingsForm.source_category
    };

    if (savingsModal.mode === 'edit' && savingsForm.id) {
      await updateSavings(savingsForm.id, payload);
    } else {
      await addSavings(payload);
    }
    setSavingsModal({ isOpen: false, mode: 'add', initialData: null });
  };

  // Item Modal Handlers
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
    const currentAmt = Number(item.planned_amount) || 0;
    setItemForm({
      id: item.id,
      title: item.title || '',
      category: item.category || CATEGORIES[0] || 'Venue',
      vendor_name: item.vendor_name || '',
      planned_amount: formatNumberInput(currentAmt),
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

    const plannedAmt = evaluateMath(itemForm.planned_amount);
    const actual = evaluateMath(itemForm.actual_amount);
    const paid = evaluateMath(itemForm.paid_amount);

    const payload = {
      title,
      category: itemForm.category || 'Venue',
      vendor_name: (itemForm.vendor_name || '').trim(),
      plan_id: activePlanObj.id,
      planned_amount: plannedAmt,
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
    }

    setItemModal({ isOpen: false, mode: 'add', initialData: null });
  };

  const handleAddRow = async () => {
    await addExpense({
      title: language === 'id' ? 'Deskripsi' : 'Description',
      category: CATEGORIES[0] || 'Venue',
      vendor_name: '',
      plan_id: activePlanObj.id,
      planned_amount: 0,
      actual_amount: 0,
      paid_amount: 0,
      amount: 0,
      is_paid: false,
      deadline: null,
      type: 'expense'
    });
  };

  // Editable Cells Logic
  const startEditing = (expense, field) => {
    if (isReadOnly) return;
    setEditingCell({ id: expense.id, field });

    if (field === 'title') setEditValue(expense.title || '');
    else if (field === 'category') setEditValue(expense.category || CATEGORIES[0] || 'Venue');
    else if (field === 'vendor_name') setEditValue(expense.vendor_name || '');
    else if (field === 'deadline') setEditValue(expense.deadline || '');
    else if (field === 'planned_amount') {
      const amt = Number(expense.planned_amount) || 0;
      setEditValue(formatNumberInput(amt));
    }
    else if (field === 'actual_amount') setEditValue(formatNumberInput(expense.actual_amount));
    else if (field === 'paid_amount') setEditValue(formatNumberInput(expense.paid_amount));
  };

  const handleBlur = async (expense) => {
    if (!editingCell) return;
    const field = editingCell.field;
    let finalValue = evaluateMath(editValue);

    if (['title', 'category', 'vendor_name', 'deadline'].includes(field)) {
      finalValue = editValue;
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

  // Filtered & Sorted Table Data
  const processedData = useMemo(() => {
    let data = activePlanExpenses.filter(e => {
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

        if (key === 'planned_amount') {
          const numA = Number(a.planned_amount) || 0;
          const numB = Number(b.planned_amount) || 0;
          return (numA - numB) * multiplier;
        }

        if (['actual_amount', 'paid_amount'].includes(key)) {
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
  }, [activePlanExpenses, searchTerm, filterStatuses, sortConfig]);

  // Mobile Accordion Grouping
  const categoryStats = useMemo(() => {
    const map = {};
    allCategories.forEach(cat => {
      map[cat] = { name: cat, items: [], planned: 0, actual: 0, paid: 0, sisa: 0 };
    });

    activePlanExpenses.forEach(item => {
      const cat = item.category || 'Venue';
      if (!map[cat]) {
        map[cat] = { name: cat, items: [], planned: 0, actual: 0, paid: 0, sisa: 0 };
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
  }, [allCategories, validExpenses, activePlanObj.id]);

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  return (
    <div className="budget-container">
      {/* Header & Sub-Nav Switcher */}
      <header className="page-header budget-page-header">
        <div>
          <h1>{t('budget.title')}</h1>
          <p className="subtitle">{t('budget.subtitle')}</p>
        </div>

        {/* Sub-Section Switcher Tabs */}
        <div className="budget-nav-tabs">
          <button
            type="button"
            className={`budget-tab-pill ${activeTab === 'budgeting' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgeting')}
          >
            BUDGETING
          </button>
          <button
            type="button"
            className={`budget-tab-pill ${activeTab === 'dana-nikah' ? 'active' : ''}`}
            onClick={() => setActiveTab('dana-nikah')}
          >
            DANA NIKAH
          </button>
          <button
            type="button"
            className={`budget-tab-pill ${activeTab === 'pembayaran' ? 'active' : ''}`}
            onClick={() => setActiveTab('pembayaran')}
          >
            PEMBAYARAN
          </button>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: BUDGETING (PIXEL-PERFECT TO USER'S LATEST SCREENSHOT)
          ========================================================================= */}
      {activeTab === 'budgeting' && (
        <div className="budgeting-section-content">
          {/* Top Summary Cards Grid (Target Budget & Estimasi Biaya) */}
          <div className="budgeting-top-grid">
            {/* Left Card: TARGET BUDGET (Maroon) */}
            <div className="target-budget-card">
              <div className="target-card-top">
                <span className="target-card-label">TARGET BUDGET</span>
                {!isReadOnly && (
                  <button type="button" className="btn-atur-target" onClick={openTargetModal}>
                    ATUR TARGET <Edit3 size={13} style={{ marginLeft: '4px' }} />
                  </button>
                )}
              </div>

              <h2 className="target-card-amount">{formatCurrency(totalBudget)}</h2>

              {/* Progress Bar */}
              <div className="target-progress-container">
                <div className="target-progress-bg">
                  <div
                    className="target-progress-fill"
                    style={{ width: `${percentTerpakai}%` }}
                  ></div>
                </div>
                <div className="target-progress-labels">
                  <span>{percentTerpakai}% TERPAKAI</span>
                </div>
              </div>
            </div>

            {/* Right Card: ESTIMASI BIAYA (White Box Card) */}
            <div className="estimasi-biaya-card">
              <div className="estimasi-card-header">
                <span className="estimasi-card-label">ESTIMASI BIAYA ({activePlanObj.name})</span>
                {totalActivePlanAmount <= totalBudget ? (
                  <span className="estimasi-badge safe">SISA {formatCurrency(totalBudget - totalActivePlanAmount)}</span>
                ) : (
                  <span className="estimasi-badge over">OVER +{formatCurrency(totalActivePlanAmount - totalBudget)}</span>
                )}
              </div>
              <h2 className="estimasi-card-amount">{formatCurrency(totalActivePlanAmount)}</h2>
            </div>
          </div>

          {/* Plan Comparison Section Drawer */}
          {showComparePlans && (
            <div className="plan-comparison-card">
              <div className="comparison-header">
                <div className="comp-title">
                  <BarChart2 size={18} />
                  <h3>Komparasi Skenario Budget Plan</h3>
                </div>
                <button type="button" className="btn-close-comp" onClick={() => setShowComparePlans(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="comparison-grid">
                {currentPlans.map(plan => {
                  const total = planTotalsMap[plan.id] || 0;
                  const isCurrent = plan.id === activePlanObj.id;
                  const diffTarget = totalBudget - total;
                  const isOver = diffTarget < 0;

                  return (
                    <div key={plan.id} className={`comp-plan-item ${isCurrent ? 'active' : ''}`}>
                      <div className="comp-plan-head">
                        <span className="comp-plan-name">{plan.name}</span>
                        {isCurrent && <span className="comp-active-pill">Aktif</span>}
                      </div>
                      <div className="comp-plan-amount">{formatCurrency(total)}</div>
                      <div className="comp-plan-status">
                        {isOver ? (
                          <span className="text-danger">Over +{formatCurrency(Math.abs(diffTarget))}</span>
                        ) : (
                          <span className="text-success">Sisa {formatCurrency(diffTarget)}</span>
                        )}
                      </div>
                      <div className="comp-plan-actions">
                        <button
                          type="button"
                          className="btn-switch-comp-plan"
                          onClick={() => setActivePlanId(plan.id)}
                        >
                          {isCurrent ? 'Dipilih' : 'Gunakan Plan Ini'}
                        </button>
                        {currentPlans.length > 1 && !isReadOnly && (
                          <button
                            type="button"
                            className="btn-delete-comp-plan"
                            title={`Hapus ${plan.name}`}
                            onClick={() => setDeletingPlan(plan)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table Section Container Card */}
          <div className="budget-table-section">
            {/* Table Toolbar Header: Plan Tabs on Left, Action Icons & Search Bar on Right */}
            <div className="table-toolbar budgeting-toolbar">
              <div className="budgeting-plan-bar">
                {currentPlans.map(plan => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`plan-tab-item ${activePlanObj.id === plan.id ? 'active' : ''}`}
                    onClick={() => setActivePlanId(plan.id)}
                  >
                    <span>{plan.name}</span>
                    {currentPlans.length > 1 && !isReadOnly && (
                      <span
                        className="btn-delete-plan-pill"
                        title={`Hapus ${plan.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPlan(plan);
                        }}
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                ))}

                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn-action-icon-pill"
                    title="Tambah Plan Baru"
                    onClick={() => setShowAddPlanModal(true)}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Right Aligned Action Tools & Search Bar */}
              <div className="budgeting-right-actions">
                <div className="budgeting-action-icons">
                  {!isReadOnly && (
                    <>
                      <button
                        type="button"
                        className="btn-action-icon-pill"
                        title="Salin Plan Saat Ini"
                        onClick={handleDuplicateActivePlan}
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-action-icon-pill"
                        title="Ubah Nama Plan"
                        onClick={() => {
                          setRenamingPlan(activePlanObj);
                          setRenamePlanInput(activePlanObj.name);
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      {currentPlans.length > 1 && (
                        <button
                          type="button"
                          className="btn-action-icon-pill danger"
                          title="Hapus Plan Saat Ini"
                          onClick={() => setDeletingPlan(activePlanObj)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    className={`btn-action-icon-pill ${showComparePlans ? 'active' : ''}`}
                    title="Komparasi Skenario Plan"
                    onClick={() => setShowComparePlans(!showComparePlans)}
                  >
                    <BarChart2 size={15} />
                  </button>                </div>

                <div className="search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Cari kebutuhan atau vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Table (3 Columns: KEBUTUHAN, VENDOR, BUDGET) */}
            <div className="table-container">
              <table className="budget-table">
                <thead>
                  <tr>
                    <th
                      style={{ width: '45%', textAlign: 'left' }}
                      onClick={() => handleSort('kebutuhan')}
                      className={`th-sortable ${sortConfig.key === 'kebutuhan' ? 'sorted' : ''}`}
                    >
                      <div className="th-content" style={{ justifyContent: 'flex-start' }}>
                        <span>KEBUTUHAN</span>
                        <span className="th-sort-icon">
                          {sortConfig.key === 'kebutuhan' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="sort-icon-active" /> : <ArrowDown size={12} className="sort-icon-active" />
                          ) : (
                            <ArrowUpDown size={11} className="sort-icon-idle" />
                          )}
                        </span>
                      </div>
                    </th>

                    <th
                      style={{ width: '30%', textAlign: 'left' }}
                      onClick={() => handleSort('vendor_name')}
                      className={`th-sortable ${sortConfig.key === 'vendor_name' ? 'sorted' : ''}`}
                    >
                      <div className="th-content" style={{ justifyContent: 'flex-start' }}>
                        <span>VENDOR</span>
                        <span className="th-sort-icon">
                          {sortConfig.key === 'vendor_name' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="sort-icon-active" /> : <ArrowDown size={12} className="sort-icon-active" />
                          ) : (
                            <ArrowUpDown size={11} className="sort-icon-idle" />
                          )}
                        </span>
                      </div>
                    </th>

                    <th
                      style={{ width: '20%', textAlign: 'right' }}
                      onClick={() => handleSort('planned_amount')}
                      className={`th-sortable ${sortConfig.key === 'planned_amount' ? 'sorted' : ''}`}
                    >
                      <div className="th-content" style={{ justifyContent: 'flex-end' }}>
                        <span>BUDGET</span>
                        <span className="th-sort-icon">
                          {sortConfig.key === 'planned_amount' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="sort-icon-active" /> : <ArrowDown size={12} className="sort-icon-active" />
                          ) : (
                            <ArrowUpDown size={11} className="sort-icon-idle" />
                          )}
                        </span>
                      </div>
                    </th>

                    <th style={{ width: '5%', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map(expense => {
                    const planAmt = Number(expense.planned_amount) || 0;
                    const isEditing = (field) => editingCell?.id === expense.id && editingCell?.field === field;

                    return (
                      <tr key={expense.id}>
                        <td>
                          <div className="kebutuhan-cell">
                            <select
                              className="category-dropdown-select"
                              value={expense.category || CATEGORIES[0] || 'Venue'}
                              disabled={isReadOnly}
                              onChange={(e) => handleCategorySelectChange(e, expense.id)}
                            >
                              {allCategories.map(cat => (
                                <option key={cat} value={cat}>
                                  {displayCategory(cat)}
                                </option>
                              ))}
                              <option value="__ADD_NEW__">+ Tambah Kategori Baru...</option>
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
                              />
                            ) : (
                              <div onClick={() => startEditing(expense, 'title')} className="cell-clickable muted">
                                {expense.title || '+ Detail'}
                              </div>
                            )}
                          </div>
                        </td>

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
                            <div onClick={() => startEditing(expense, 'vendor_name')} className="cell-clickable">
                              {expense.vendor_name || <span className="placeholder-text">Tulis...</span>}
                            </div>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {isEditing('planned_amount') ? (
                            <input
                              type="text"
                              className="editable-input math-input"
                              value={editValue}
                              onChange={e => setEditValue(formatNumberInput(e.target.value))}
                              onBlur={() => handleBlur(expense)}
                              onKeyDown={(e) => handleKeyDown(e, expense)}
                              autoFocus
                            />
                          ) : (
                            <span className="amount-text" onClick={() => startEditing(expense, 'planned_amount')}>
                              {formatCurrency(planAmt)}
                            </span>
                          )}
                        </td>

                        <td className="table-action-cell">
                          {!isReadOnly && (
                            <button
                              onClick={() => setDeletingExpense(expense)}
                              className="btn-icon-danger"
                              title="Hapus Kebutuhan"
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
                  <Plus size={18} /> Tambah Pengeluaran
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: DANA NIKAH (MATCHING IMAGE 2 EXACTLY)
          ========================================================================= */}
      {activeTab === 'dana-nikah' && (
        <div className="dana-nikah-section-content">
          {/* Top Summary Cards Grid */}
          <div className="dana-nikah-cards-grid">
            {/* Main Dark Red Card */}
            <div className="dana-nikah-main-card">
              <div className="dana-card-top">
                <span className="dana-card-label">DANA TERKUMPUL</span>
                {!isReadOnly && (
                  <button type="button" className="btn-atur-target" onClick={openTargetModal}>
                    ATUR TARGET <Edit3 size={13} style={{ marginLeft: '4px' }} />
                  </button>
                )}
              </div>

              <h2 className="dana-card-amount">{formatCurrency(totalDanaTerkumpul)}</h2>

              {/* Progress Bar */}
              <div className="dana-progress-container">
                <div className="dana-progress-bg">
                  <div
                    className="dana-progress-fill"
                    style={{ width: `${percentDanaTerkumpul}%` }}
                  ></div>
                </div>
                <div className="dana-progress-labels">
                  <span>{percentDanaTerkumpul}% TERCAPAI</span>
                  <span>TARGET {formatCurrency(totalBudget)}</span>
                </div>
              </div>
            </div>

            {/* Right Side Stats Column */}
            <div className="dana-nikah-side-stats">
              <div className="dana-side-card">
                <span className="side-card-label">RATA-RATA PER BULAN</span>
                <p className="side-card-value text-primary">{formatCurrency(rataRataPerBulan)}</p>
              </div>

              <div className="dana-side-card">
                <span className="side-card-label">REKOMENDASI PER BULAN</span>
                <p className="side-card-value text-primary">{formatCurrency(rekomendasiPerBulan)}</p>
              </div>
            </div>
          </div>

          {/* Section Riwayat Tabungan */}
          <div className="riwayat-tabungan-section">
            <div className="riwayat-header">
              <h2>RIWAYAT TABUNGAN</h2>
              {!isReadOnly && (
                <button type="button" className="btn-tambah-tabungan" onClick={openAddSavingsModal}>
                  + TAMBAH
                </button>
              )}
            </div>

            {/* List of Savings Entries */}
            <div className="riwayat-list">
              {savings && savings.length > 0 ? (
                savings.map(item => (
                  <div className="riwayat-item-card" key={item.id}>
                    <div className="riwayat-item-left">
                      <h4 className="riwayat-item-title">{item.title}</h4>
                      <span className="riwayat-item-date">{formatDate(item.date)}</span>
                    </div>

                    <div className="riwayat-item-right">
                      <span className="riwayat-item-amount">+ {formatCurrency(item.amount)}</span>
                      {!isReadOnly && (
                        <div className="riwayat-actions">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => openEditSavingsModal(item)}
                            title="Edit Tabungan"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action danger"
                            onClick={() => setDeletingSavings(item)}
                            title="Hapus Tabungan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="riwayat-empty">
                  <p>Belum ada riwayat tabungan. Klik tombol <strong>+ TAMBAH</strong> untuk mengisi dana terkumpul.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: PEMBAYARAN (MATCHING IMAGE 1 EXACTLY, NO BUDGET COLUMN)
          ========================================================================= */}
      {activeTab === 'pembayaran' && (
        <div className="pembayaran-section-content">
          {/* Top Summary Matrix */}
          <div className="budget-matrix">
            <div className="matrix-primary">
              <div
                className="matrix-card total-budget-card"
                onClick={openTargetModal}
                title={isReadOnly ? 'Akses Lihat Saja' : 'Klik untuk ubah budget'}
              >
                <div className="card-header">
                  <h3>TOTAL BUDGET</h3>
                  {!isReadOnly && <Edit3 size={16} opacity={0.7} />}
                </div>
                <p className="amount">{formatCurrency(totalBudget)}</p>
              </div>

              <div className={`matrix-card sisa-budget-card ${sisaBudget < 0 ? 'deficit' : ''}`}>
                <div className="card-header">
                  <h3>SISA BUDGET</h3>
                </div>
                <p className={`amount ${sisaBudget < 0 ? 'text-danger' : ''}`}>
                  {formatCurrency(sisaBudget)}
                </p>
              </div>
            </div>

            <div className="matrix-secondary">
              <div className="matrix-card dibayar-card">
                <h3>PEMBAYARAN SELESAI</h3>
                <p className="amount-small text-success">{formatCurrency(sudahDibayar)}</p>
              </div>
              <div className="matrix-card sisa-bayar-card">
                <h3>SISA PEMBAYARAN</h3>
                <p className="amount-small text-warning">{formatCurrency(totalSisaPembayaran)}</p>
              </div>
            </div>
          </div>

          {/* Budget Health Progress Bar */}
          <div className="budget-health-section">
            <div className="health-header">
              <h4>Kesehatan Anggaran</h4>
              <span className="health-badge" style={{ backgroundColor: budgetHealth.bg, color: budgetHealth.textColor }}>
                {budgetHealth.labelId}
              </span>
            </div>
            <div className="health-bar-bg">
              <div
                className="health-bar-fill"
                style={{ width: `${budgetHealth.percentage}%`, backgroundColor: budgetHealth.color }}
              ></div>
            </div>
          </div>

          {/* Desktop Table Section */}
          <div className="budget-table-section budget-desktop-table">
            <div className="table-toolbar">
              <div className="filter-pills">
                <button className={`filter-pill ${filterStatuses.includes('belum-bayar') ? 'active' : ''}`} onClick={() => toggleFilter('belum-bayar')}>Belum Bayar</button>
                <button className={`filter-pill ${filterStatuses.includes('cicilan') ? 'active' : ''}`} onClick={() => toggleFilter('cicilan')}>Cicilan</button>
                <button className={`filter-pill ${filterStatuses.includes('lunas') ? 'active' : ''}`} onClick={() => toggleFilter('lunas')}>Lunas</button>
              </div>
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Cari kebutuhan atau vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              <table className="budget-table">
                <thead>
                  <tr>
                    {DEFAULT_COLUMNS_PEMBAYARAN.map((col) => (
                      <th
                        key={col.id}
                        style={{ width: col.width }}
                        onClick={() => handleSort(col.id)}
                        className={`th-sortable ${sortConfig.key === col.id ? 'sorted' : ''}`}
                      >
                        <div className="th-content">
                          <span>{language === 'id' ? col.labelId : col.labelEn}</span>
                          <span className="th-sort-icon">
                            {sortConfig.key === col.id ? (
                              sortConfig.direction === 'asc' ? <ArrowUp size={12} className="sort-icon-active" /> : <ArrowDown size={12} className="sort-icon-active" />
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
                                onChange={(e) => handleCategorySelectChange(e, expense.id)}
                              >
                                {allCategories.map(cat => (
                                  <option key={cat} value={cat}>
                                    {displayCategory(cat)}
                                  </option>
                                ))}
                                <option value="__ADD_NEW__">+ Tambah Kategori Baru...</option>
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
                                />
                              ) : (
                                <div onClick={() => startEditing(expense, 'title')} className="cell-clickable muted">
                                  {expense.title || '+ Detail'}
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
                              {expense.vendor_name || <span className="placeholder-text">Tulis...</span>}
                            </div>
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
                            />
                          ) : (
                            <span className={`amount-text ${expense.paid_amount > 0 ? 'text-success' : ''}`} onClick={() => startEditing(expense, 'paid_amount')}>
                              {formatCurrency(paid)}
                            </span>
                          );
                        case 'sisa':
                          return (
                            <span className={`amount-text ${sisa > 0 ? 'text-warning' : ''}`}>
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
                              {expense.deadline ? formatDate(expense.deadline) : <span className="placeholder-text">Pilih...</span>}
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
                        {DEFAULT_COLUMNS_PEMBAYARAN.map(col => (
                          <td key={col.id} style={{ textAlign: ['actual_amount', 'paid_amount', 'sisa'].includes(col.id) ? 'right' : 'left' }}>
                            {renderCellContent(col)}
                          </td>
                        ))}
                        <td className="table-action-cell">
                          {!isReadOnly && (
                            <button
                              onClick={() => setDeletingExpense(expense)}
                              className="btn-icon-danger"
                              title="Hapus Pengeluaran"
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
                  <Plus size={18} /> Tambah Pengeluaran
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <button onClick={() => setShowTargetModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Ubah Target Anggaran</h3>
            <form onSubmit={handleUpdateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">Target Anggaran (Rp)</label>
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
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Simpan Target</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Plan Baru */}
      {showAddPlanModal && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <button onClick={() => setShowAddPlanModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '16px' }}>Tambah Plan Anggaran Baru</h3>
            <form onSubmit={handleCreateNewPlan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Plan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Plan C, Plan Hemat, Plan Outdoor"
                  value={newPlanNameInput}
                  onChange={e => setNewPlanNameInput(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddPlanModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Buat Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rename Plan */}
      {renamingPlan && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <button onClick={() => setRenamingPlan(null)} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '16px' }}>Ubah Nama Plan</h3>
            <form onSubmit={handleRenamePlan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Plan Baru *</label>
                <input
                  type="text"
                  required
                  value={renamePlanInput}
                  onChange={e => setRenamePlanInput(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setRenamingPlan(null)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori Baru */}
      {addCategoryModal.isOpen && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <button
              onClick={() => setAddCategoryModal({ isOpen: false, targetExpenseId: null, fromItemForm: false })}
              className="modal-close"
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '8px' }}>Tambah Kategori Baru</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Masukkan nama kategori kebutuhan baru yang ingin Anda tambahkan ke pilihan.
            </p>
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bulan Madu, Lamaran, Prewedding"
                  value={newCategoryInput}
                  onChange={e => setNewCategoryInput(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddCategoryModal({ isOpen: false, targetExpenseId: null, fromItemForm: false })}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Savings (Dana Nikah) */}
      {savingsModal.isOpen && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '440px', width: '90%' }}>
            <button onClick={() => setSavingsModal({ isOpen: false, mode: 'add', initialData: null })} className="modal-close"><X size={20} /></button>
            <h3 style={{ marginBottom: '16px' }}>
              {savingsModal.mode === 'edit' ? 'Edit Riwayat Tabungan' : 'Tambah Tabungan Baru'}
            </h3>
            <form onSubmit={handleSaveSavingsModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Judul / Sumber Tabungan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TABUNGAN ROMEO, DARI AYAH JULIET"
                  value={savingsForm.title}
                  onChange={e => setSavingsForm({ ...savingsForm, title: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Tabungan CPP, Hadiah, Transfer Bank, dll."
                  value={savingsForm.source_category}
                  onChange={e => setSavingsForm({ ...savingsForm, source_category: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Nominal (Rp) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={savingsForm.amount}
                  onChange={e => setSavingsForm({ ...savingsForm, amount: formatNumberInput(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Tanggal Masuk *</label>
                <input
                  type="date"
                  required
                  value={savingsForm.date}
                  onChange={e => setSavingsForm({ ...savingsForm, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSavingsModal({ isOpen: false, mode: 'add', initialData: null })}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Tabungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Expense Deletion */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
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
        title="Hapus Kebutuhan Ini?"
        message="Item kebutuhan yang dihapus tidak dapat dikembalikan."
        itemName={deletingExpense?.title || ''}
        confirmText="Hapus"
        cancelText="Batal"
      />

      {/* Confirmation Modal for Savings Deletion */}
      <ConfirmModal
        isOpen={!!deletingSavings}
        onClose={() => setDeletingSavings(null)}
        onConfirm={async () => {
          if (!deletingSavings) return;
          try {
            setIsDeleting(true);
            await deleteSavings(deletingSavings.id);
            setDeletingSavings(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title="Hapus Tabungan Ini?"
        message="Riwayat tabungan ini akan dihapus dari data terkumpul."
        itemName={deletingSavings?.title || ''}
        confirmText="Hapus"
        cancelText="Batal"
      />

      {/* Confirmation Modal for Plan Deletion */}
      <ConfirmModal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={async () => {
          if (!deletingPlan) return;
          deleteBudgetPlan(deletingPlan.id);
          setDeletingPlan(null);
        }}
        isLoading={false}
        title="Hapus Plan Anggaran Ini?"
        message="Plan anggaran ini akan dihapus dari daftar skenario."
        itemName={deletingPlan?.name || ''}
        confirmText="Hapus Plan"
        cancelText="Batal"
      />

      {/* Add / Edit Expense Item Modal */}
      {itemModal.isOpen && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '480px', width: '92%' }}>
            <button
              type="button"
              onClick={() => setItemModal({ isOpen: false, mode: 'add', initialData: null })}
              className="modal-close"
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '14px' }}>
              {itemModal.mode === 'edit' ? 'Edit Kebutuhan' : 'Tambah Kebutuhan Baru'}
            </h3>

            <form onSubmit={handleSaveItemModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Kebutuhan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Gedung, Catering 500 Pax"
                  value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Kategori *</label>
                  <select
                    value={itemForm.category}
                    onChange={handleFormCategorySelectChange}
                    className="form-input"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {displayCategory(cat)}
                      </option>
                    ))}
                    <option value="__ADD_NEW__">+ Tambah Kategori Baru...</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Vendor (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Nama Vendor"
                    value={itemForm.vendor_name}
                    onChange={e => setItemForm({ ...itemForm, vendor_name: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Estimasi Budget untuk {activePlanObj.name} (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={itemForm.planned_amount}
                  onChange={e => setItemForm({ ...itemForm, planned_amount: formatNumberInput(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Aktual (Rp)</label>
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
                  <label className="form-label">Dibayar (Rp)</label>
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
                <label className="form-label">Jatuh Tempo (Opsional)</label>
                <input
                  type="date"
                  value={itemForm.deadline}
                  onChange={e => setItemForm({ ...itemForm, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, mode: 'add', initialData: null })}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Kebutuhan
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
