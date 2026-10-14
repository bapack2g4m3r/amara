import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, 
  ShoppingBag, CheckCircle2, X, Plus, Wallet, ArrowUpRight, Sparkles,
  Search, ArrowUpDown
} from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { getStoredAffiliates, SESERAHAN_CATEGORIES, findAffiliateRecommendation } from '../data/seserahanAffiliates';
import { formatThousand, parseThousand } from '../utils/currencyFormatter';
import TutorialTriggerButton from '../components/TutorialTriggerButton';
import '../styles/Seserahan.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const cleanUrlInput = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  // Extract URL from snippet if present (e.g. Shopee / Tokopedia share text: "Beli Mukena di Shopee https://s.shopee.co.id/...")
  const urlMatch = str.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    return urlMatch[0];
  }
  return str;
};

const formatUrl = (url) => {
  if (!url) return '#';
  const cleaned = cleanUrlInput(url);
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
};

const Seserahan = () => {
  const navigate = useNavigate();

  const {
    seserahanItems = [],
    addSeserahanItem,
    toggleSeserahanItem,
    updateSeserahanItem,
    deleteSeserahanItem,
    expenses = [],
    budgetPlans = [],
    activePlanId = 'plan_a',
    addExpense,
    updateExpense,
    userRole
  } = useWeddingStore();

  const isReadOnly = userRole === 'viewer';

  // Dynamic affiliate data synced with Admin CRUD
  const [affiliatesData, setAffiliatesData] = useState(() => getStoredAffiliates());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setAffiliatesData(e.detail);
      } else {
        setAffiliatesData(getStoredAffiliates());
      }
    };
    window.addEventListener('amara_affiliates_updated', handleUpdate);
    return () => window.removeEventListener('amara_affiliates_updated', handleUpdate);
  }, []);

  // Ensure latest seserahan data from database is synced when page mounts
  useEffect(() => {
    useWeddingStore.getState().fetchDashboardData(true);
  }, []);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    brand: '',
    price: '',
    link: ''
  });

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    brand: '',
    price: '',
    link: ''
  });

  const [deletingItem, setDeletingItem] = useState(null);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // State accordion rekomendasi produk mana yang sedang terbuka
  const [expandedRecItemIds, setExpandedRecItemIds] = useState({});

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastAction, setToastAction] = useState(null);

  const showToast = (msg, action = null) => {
    setToastMessage(msg);
    setToastAction(action);
    setTimeout(() => {
      setToastMessage(null);
      setToastAction(null);
    }, action ? 5000 : 3000);
  };

  const toggleAccordion = (itemId) => {
    setExpandedRecItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter & Search & Sort States
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'bought'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Calculations
  const totalCount = seserahanItems.length;
  const boughtCount = useMemo(() => {
    return seserahanItems.filter(item => item.is_bought).length;
  }, [seserahanItems]);

  // Financial Calculations for Seserahan
  const totalEstimatedCost = useMemo(() => {
    return seserahanItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [seserahanItems]);

  const boughtEstimatedCost = useMemo(() => {
    return seserahanItems
      .filter(item => item.is_bought)
      .reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [seserahanItems]);

  const remainingEstimatedCost = Math.max(0, totalEstimatedCost - boughtEstimatedCost);

  const pricedCount = useMemo(() => {
    return seserahanItems.filter(item => Number(item.price) > 0).length;
  }, [seserahanItems]);

  // Available budget plans list
  const availablePlans = useMemo(() => {
    if (budgetPlans && budgetPlans.length > 0) return budgetPlans;
    return [{ id: 'plan_a', name: 'Plan A' }, { id: 'plan_b', name: 'Plan B' }];
  }, [budgetPlans]);

  // Check if active plan already has an expense with category Seserahan
  const existingSeserahanInActivePlan = useMemo(() => {
    return (expenses || []).find(e => 
      (e.plan_id || 'plan_a') === (activePlanId || 'plan_a') && 
      (e.category || '').toLowerCase() === 'seserahan'
    );
  }, [expenses, activePlanId]);

  // State for sync to budgeting modal
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(activePlanId || 'plan_a');
  const [syncOption, setSyncOption] = useState('update'); // 'update' | 'new'
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync selectedPlanId with activePlanId when opening modal
  const handleOpenSyncModal = () => {
    if (isReadOnly || totalEstimatedCost === 0) return;
    setSelectedPlanId(activePlanId || availablePlans[0]?.id || 'plan_a');
    setSyncOption('update');
    setShowSyncModal(true);
  };

  // Find existing seserahan expense in chosen selectedPlanId
  const existingExpenseInSelectedPlan = useMemo(() => {
    return (expenses || []).find(e => 
      (e.plan_id || 'plan_a') === selectedPlanId && 
      (e.category || '').toLowerCase() === 'seserahan'
    );
  }, [expenses, selectedPlanId]);

  const handleConfirmSync = async () => {
    if (isReadOnly || totalEstimatedCost === 0) return;
    setIsSyncing(true);
    try {
      const targetPlan = availablePlans.find(p => p.id === selectedPlanId) || { name: 'Budgeting' };
      
      if (existingExpenseInSelectedPlan && syncOption === 'update') {
        await updateExpense(existingExpenseInSelectedPlan.id, {
          planned_amount: totalEstimatedCost,
          amount: existingExpenseInSelectedPlan.actual_amount ? existingExpenseInSelectedPlan.amount : totalEstimatedCost
        });
        showToast(
          `Estimasi seserahan (${formatCurrency(totalEstimatedCost)}) berhasil diperbarui di ${targetPlan.name}!`,
          {
            label: 'Lihat di Budgeting',
            onClick: () => navigate('/budget?tab=budgeting')
          }
        );
      } else {
        await addExpense({
          category: 'Seserahan',
          title: 'Paket Seserahan',
          planned_amount: totalEstimatedCost,
          actual_amount: 0,
          paid_amount: 0,
          amount: totalEstimatedCost,
          plan_id: selectedPlanId,
          notes: `Estimasi dari ${pricedCount} item di Daftar Seserahan`
        });
        showToast(
          `Estimasi seserahan (${formatCurrency(totalEstimatedCost)}) berhasil ditambahkan ke ${targetPlan.name}!`,
          {
            label: 'Lihat di Budgeting',
            onClick: () => navigate('/budget?tab=budgeting')
          }
        );
      }
      setShowSyncModal(false);
    } catch (err) {
      console.error('Error syncing seserahan to budgeting:', err);
      showToast('Gagal menyinkronkan: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper fungsi untuk menentukan apakah suatu item seserahan sudah memiliki produk terpilih/spesifik
  const isItemProductSelected = (item) => {
    if (!item) return false;
    return Boolean(
      item.selected_product_id ||
      (item.product_name && item.product_name.trim()) ||
      (item.brand && item.brand.trim()) ||
      (item.link && item.link.trim()) ||
      (item.price && Number(item.price) > 0)
    );
  };

  const selectedCount = useMemo(() => {
    return seserahanItems.filter(isItemProductSelected).length;
  }, [seserahanItems]);

  const percent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  const filteredSeserahanItems = useMemo(() => {
    let items = seserahanItems;

    // 1. Status Filter
    if (statusFilter === 'pending') {
      items = items.filter(item => !item.is_bought);
    } else if (statusFilter === 'bought') {
      items = items.filter(item => item.is_bought);
    }

    // 2. Search Filter (title, brand, product_name)
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      items = items.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const brandMatch = (item.brand || '').toLowerCase().includes(q);
        const prodMatch = (item.product_name || '').toLowerCase().includes(q);
        return titleMatch || brandMatch || prodMatch;
      });
    }

    // 3. Sorting
    if (sortBy === 'unbought_first') {
      items = [...items].sort((a, b) => {
        if (Boolean(a.is_bought) === Boolean(b.is_bought)) return 0;
        return a.is_bought ? 1 : -1;
      });
    } else if (sortBy === 'price_desc') {
      items = [...items].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'price_asc') {
      items = [...items].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'name_asc') {
      items = [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return items;
  }, [seserahanItems, statusFilter, searchQuery, sortBy]);

  // Deteksi affiliate mana saja yang sudah dipilih ke dalam seserahanItems
  const addedAffiliateIds = useMemo(() => {
    const ids = new Set();
    seserahanItems.forEach(item => {
      const match = findAffiliateRecommendation(item.title, affiliatesData);
      if (match) {
        ids.add(match.id);
      } else {
        const direct = affiliatesData.find(a => a.title.toLowerCase() === item.title.toLowerCase());
        if (direct) ids.add(direct.id);
      }
    });
    return ids;
  }, [seserahanItems, affiliatesData]);

  // Rekomendasi yang BELUM dipilih oleh user (otomatis menghilang jika sudah ada di daftar seserahan)
  const availableRecommendations = useMemo(() => {
    return affiliatesData.filter(rec => {
      if (addedAffiliateIds.has(rec.id)) return false;
      if (activeCategory !== 'all' && rec.category !== activeCategory) return false;
      return true;
    });
  }, [affiliatesData, addedAffiliateIds, activeCategory]);

  const displayedRecs = showAllRecs ? availableRecommendations : availableRecommendations.slice(0, 8);

  // Handlers
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const trimmed = addForm.title.trim();
    if (!trimmed) return;

    addSeserahanItem({
      title: trimmed,
      brand: addForm.brand.trim(),
      price: parseThousand(addForm.price),
      link: cleanUrlInput(addForm.link)
    });

    setAddForm({ title: '', brand: '', price: '', link: '' });
    setShowAddModal(false);
    showToast(`"${trimmed}" berhasil ditambahkan`);
  };

  const handleAddRecommendation = (rec) => {
    if (isReadOnly) return;
    addSeserahanItem({
      title: rec.title,
      badge_label: 'Rekomendasi'
    });
    showToast(`"${rec.title}" ditambahkan ke daftar seserahan`);
  };

  const handleSelectProduct = (item, prod) => {
    if (isReadOnly) return;
    updateSeserahanItem(item.id, {
      brand: prod.brand,
      product_name: prod.name,
      product_image: prod.image,
      selected_product_id: prod.id,
      link: prod.link,
      price: 0 // Bersihkan harga acuan agar tidak muncul nominal otomatis
    });
    showToast(`"${prod.name}" berhasil dipilih!`);

    // Auto-collapse accordion secara lembut setelah 1.2 detik agar tampilan rapi
    setTimeout(() => {
      setExpandedRecItemIds(prev => ({
        ...prev,
        [item.id]: false
      }));
    }, 1200);
  };

  const handleUnselectProduct = (item) => {
    if (isReadOnly) return;
    updateSeserahanItem(item.id, {
      brand: '',
      link: '',
      product_name: '',
      product_image: '',
      selected_product_id: null,
      price: 0
    });
    showToast(`Pilihan produk untuk "${item.title}" dilepas.`);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      brand: item.brand || '',
      price: item.price ? formatThousand(item.price) : '',
      link: item.link || ''
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly || !editingItem) return;
    const trimmed = editForm.title.trim();
    if (!trimmed) return;

    updateSeserahanItem(editingItem.id, {
      title: trimmed,
      brand: editForm.brand.trim(),
      price: parseThousand(editForm.price),
      link: cleanUrlInput(editForm.link)
    });

    setEditingItem(null);
    setEditForm({ title: '', brand: '', price: '', link: '' });
    showToast('Detail seserahan diperbarui');
  };

  const confirmDelete = () => {
    if (isReadOnly || !deletingItem) return;
    deleteSeserahanItem(deletingItem.id);
    setDeletingItem(null);
    showToast('Barang berhasil dihapus');
  };

  return (
    <div className="seserahan-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="seserahan-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
          {toastAction && (
            <button
              type="button"
              className="seserahan-toast-btn"
              onClick={toastAction.onClick}
            >
              {toastAction.label}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="page-header seserahan-page-header has-tutorial-btn">
        <div>
          <h1>Daftar Seserahan</h1>
          <p className="subtitle">Rencanakan dan kelola barang seserahan pernikahan Anda</p>
        </div>
        <TutorialTriggerButton />
      </header>

      {/* Top Section: Progress & Financial Estimation */}
      <div className="seserahan-top-grid">
        {/* Card 1: Progress Seserahan */}
        <div className="seserahan-progress-card">
          <div className="seserahan-progress-header">
            <div>
              <h3>Progress Seserahan</h3>
              <span className="seserahan-progress-sub">Checklist persiapan barang</span>
            </div>
            <span className="seserahan-progress-meta">
              {boughtCount} dari {totalCount} siap
            </span>
          </div>

          <p className="seserahan-progress-percent">{percent}%</p>

          <div className="seserahan-progress-track">
            <div
              className="seserahan-progress-fill"
              style={{ width: `${percent}%` }}
            ></div>
          </div>

          <div className="seserahan-progress-footer-info">
            <span className="seserahan-meta-tag">
              <ShoppingBag size={12} />
              <span>{selectedCount} produk spesifik dipilih</span>
            </span>
          </div>
        </div>

        {/* Card 2: Estimasi Biaya Seserahan (Untuk CPP & Pasangan) */}
        <div className="seserahan-finance-card">
          <div className="seserahan-finance-header">
            <div className="seserahan-finance-title-wrap">
              <div className="seserahan-finance-icon-box">
                <Wallet size={18} />
              </div>
              <div>
                <h3>Estimasi Biaya Seserahan</h3>
                <span className="seserahan-finance-sub">Total perkiraan anggaran</span>
              </div>
            </div>
          </div>

          <div className="seserahan-finance-main">
            <p className="seserahan-finance-amount">{formatCurrency(totalEstimatedCost)}</p>
            <div className="seserahan-finance-count-info">
              {pricedCount > 0 ? (
                <span>
                  <strong>{pricedCount}</strong> dari {totalCount} item memiliki estimasi harga
                </span>
              ) : (
                <span className="seserahan-count-hint">
                  Belum ada item dengan estimasi harga. Klik Edit pada item untuk mengisi harga.
                </span>
              )}
            </div>
          </div>

          {/* Breakdown Mini Bar */}
          <div className="seserahan-finance-breakdown">
            <div 
              className={`seserahan-breakdown-col is-bought ${statusFilter === 'bought' ? 'is-active-filter' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'bought' ? 'all' : 'bought')}
              title="Klik untuk melihat barang yang sudah dibeli"
              role="button"
              tabIndex={0}
            >
              <span className="breakdown-label">Sudah Dibeli</span>
              <span className="breakdown-val">{formatCurrency(boughtEstimatedCost)}</span>
            </div>
            <div className="seserahan-breakdown-divider"></div>
            <div 
              className={`seserahan-breakdown-col is-remaining ${statusFilter === 'pending' ? 'is-active-filter' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
              title="Klik untuk melihat barang yang belum dibeli"
              role="button"
              tabIndex={0}
            >
              <span className="breakdown-label">Belum Dibeli</span>
              <span className="breakdown-val">{formatCurrency(remainingEstimatedCost)}</span>
            </div>
          </div>

          {/* Action Row: CTA to Budgeting */}
          <div className="seserahan-finance-actions">
            {!isReadOnly && (
              <button
                type="button"
                className="btn-sync-to-budget"
                onClick={handleOpenSyncModal}
                disabled={totalEstimatedCost === 0}
                title={totalEstimatedCost === 0 ? "Isi estimasi harga pada item terlebih dahulu" : "Masukkan estimasi biaya ini ke Budgeting"}
              >
                <ArrowUpRight size={15} />
                <span>Masukkan ke Budgeting</span>
              </button>
            )}

            {existingSeserahanInActivePlan && (
              <div className="seserahan-synced-pill" title="Pos anggaran Seserahan yang saat ini tercatat di halaman Budgeting">
                <span className="synced-dot"></span>
                <span>Di Budgeting: <strong>{formatCurrency(existingSeserahanInActivePlan.planned_amount || existingSeserahanInActivePlan.amount)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="seserahan-main-grid">
        {/* Left Column: DAFTAR SESERAHAN */}
        <div className="seserahan-list-card">
          <div className="seserahan-list-header">
            <div>
              <h2>DAFTAR SESERAHAN</h2>
              <span className="seserahan-count-caption">{seserahanItems.length} item terdaftar</span>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                className="btn-tambah-seserahan"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Tambah</span>
              </button>
            )}
          </div>

          {/* Controls: Filter Pills + Search & Sort Bar */}
          {seserahanItems.length > 0 && (
            <div className="seserahan-controls-container">
              {/* Row 1: Filter Status Pills */}
              <div className="seserahan-filter-bar">
                <button
                  type="button"
                  className={`seserahan-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Semua ({totalCount})
                </button>
                <button
                  type="button"
                  className={`seserahan-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Belum Dibeli ({totalCount - boughtCount})
                </button>
                <button
                  type="button"
                  className={`seserahan-filter-pill ${statusFilter === 'bought' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('bought')}
                >
                  Sudah Dibeli ({boughtCount})
                </button>
              </div>

              {/* Row 2: Search & Sort Bar */}
              <div className="seserahan-search-sort-bar">
                <div className="seserahan-search-box">
                  <Search size={15} className="seserahan-search-icon" />
                  <input
                    type="text"
                    placeholder="Cari barang, brand, atau produk..."
                    className="seserahan-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="seserahan-search-clear"
                      onClick={() => setSearchQuery('')}
                      title="Hapus pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="seserahan-sort-box">
                  <ArrowUpDown size={14} className="seserahan-sort-icon" />
                  <select
                    className="seserahan-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Urutkan daftar seserahan"
                  >
                    <option value="default">Urutan Default</option>
                    <option value="unbought_first">Belum Dibeli Dahulu</option>
                    <option value="price_desc">Harga Tertinggi</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="name_asc">Nama (A - Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="seserahan-items-wrapper">
            {seserahanItems.length === 0 ? (
              <div className="seserahan-empty-state">
                <ShoppingBag size={34} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                <p>Belum ada daftar seserahan. Klik <strong>+ Tambah</strong> atau pilih dari rekomendasi di samping.</p>
              </div>
            ) : filteredSeserahanItems.length === 0 ? (
              <div className="seserahan-empty-state">
                {searchQuery ? (
                  <>
                    <Search size={32} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                    <p>
                      Tidak ditemukan barang seserahan yang cocok dengan "<strong>{searchQuery}</strong>".
                    </p>
                    <button
                      type="button"
                      className="btn-reset-filter"
                      onClick={() => setSearchQuery('')}
                    >
                      Hapus Pencarian
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={30} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                    <p>
                      {statusFilter === 'pending'
                        ? 'Luar biasa! Semua barang seserahan sudah siap dan dibeli 🎉'
                        : 'Belum ada barang yang ditandai sudah dibeli.'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              filteredSeserahanItems.map((item) => {
                const affiliateMatch = findAffiliateRecommendation(item.title, affiliatesData);
                const isExpanded = !!expandedRecItemIds[item.id];
                const selectedProd = affiliateMatch?.products?.find(p => 
                  (item.selected_product_id && item.selected_product_id === p.id) || 
                  (item.link && item.link === p.link)
                );
                const productNameToDisplay = item.product_name || selectedProd?.name || item.brand || '';

                return (
                  <div key={item.id} className={`seserahan-item-block ${item.is_bought ? 'is-bought' : ''}`}>
                    <div className="seserahan-main-row">
                      <div className="seserahan-row-left">
                        <button
                          type="button"
                          className={`seserahan-checkbox ${item.is_bought ? 'checked' : ''}`}
                          onClick={() => !isReadOnly && toggleSeserahanItem(item.id)}
                          disabled={isReadOnly}
                          title={isReadOnly ? 'Akses Lihat Saja' : item.is_bought ? 'Tandai belum dibeli' : 'Tandai sudah dibeli'}
                        >
                          {item.is_bought && <Check size={13} strokeWidth={3} />}
                        </button>

                        <div className="seserahan-item-content">
                          <div className="seserahan-item-headline">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className={`seserahan-item-title ${item.is_bought ? 'bought' : ''}`}>
                                {item.title}
                              </span>
                              {item.price > 0 && (
                                <span className="seserahan-headline-price" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                  {formatCurrency(item.price)}
                                </span>
                              )}
                            </div>
                            {item.badge_label && (
                              <span className="seserahan-item-badge">Rekomendasi</span>
                            )}
                          </div>

                          {/* Info baris: Produk Terpilih / Brand & Link */}
                          {(productNameToDisplay || item.brand || item.link) && (
                            <div className="seserahan-item-subline">
                              {productNameToDisplay ? (
                                <div className="seserahan-selected-chip" title={productNameToDisplay}>
                                  <CheckCircle2 size={13} className="selected-icon" />
                                  <span className="selected-label">Pilihan:</span>
                                  <span className="selected-name">
                                    {productNameToDisplay}
                                  </span>
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      className="btn-remove-selected-chip"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnselectProduct(item);
                                      }}
                                      title="Lepas pilihan produk ini"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ) : item.brand ? (
                                <span className="seserahan-sub-brand">{item.brand}</span>
                              ) : null}


                              {item.link && (
                                <a
                                  href={formatUrl(item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                  className="seserahan-sub-link"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Lihat katalog produk ini"
                                >
                                  Lihat Produk <ExternalLink size={10} strokeWidth={2.2} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="seserahan-row-actions">
                          <button
                            type="button"
                            className="btn-action-icon edit"
                            title="Ubah detail barang"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon delete"
                            title="Hapus barang"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion Bar Rekomendasi Produk Terintegrasi */}
                    {affiliateMatch && affiliateMatch.products && affiliateMatch.products.length > 0 && (
                      <div className="seserahan-accordion-area">
                        <button
                          type="button"
                          className={`seserahan-accordion-trigger ${isExpanded ? 'open' : ''} ${selectedProd ? 'has-selected' : ''}`}
                          onClick={() => toggleAccordion(item.id)}
                        >
                          <span className="accordion-trigger-text">
                            <ShoppingBag size={14} className="accordion-trigger-icon" />
                            <span>{affiliateMatch.products.length} Rekomendasi Produk Pilihan</span>
                            {selectedProd && (
                              <span className="accordion-selected-indicator">• 1 Produk Terpilih</span>
                            )}
                          </span>
                          <span className="accordion-trigger-chevron">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="seserahan-product-list">
                            {affiliateMatch.products.map((prod) => {
                              const isSelected = Boolean(selectedProd && selectedProd.id === prod.id);
                              const hasAnySelected = Boolean(selectedProd);

                              return (
                                <div key={prod.id} className={`seserahan-product-card ${isSelected ? 'is-selected' : ''}`}>
                                  {isSelected && (
                                    <div className="card-selected-ribbon">
                                      <Check size={11} strokeWidth={3} />
                                      <span>Terpilih untuk Seserahan</span>
                                    </div>
                                  )}

                                  <div className="product-thumbnail-box">
                                    <img
                                      src={prod.image}
                                      alt={prod.name}
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80';
                                      }}
                                    />
                                  </div>

                                  <div className="product-info-box">
                                    <div className="product-meta-top">
                                      <span className="product-brand-tag">{prod.brand}</span>
                                      <span className={`product-tier-tag ${prod.tier === 'Premium' ? 'tier-premium' : prod.tier === 'Populer' ? 'tier-populer' : 'tier-hemat'}`}>
                                        {prod.tier}
                                      </span>
                                    </div>

                                    <h5 className="product-title-text">{prod.name}</h5>

                                    <div className="product-button-row">
                                      {isSelected ? (
                                        <button
                                          type="button"
                                          className="btn-apply-product is-selected-green"
                                          onClick={() => handleUnselectProduct(item)}
                                          disabled={isReadOnly}
                                          title="Klik untuk membatalkan / melepas produk pilihan ini"
                                        >
                                          <Check size={13} strokeWidth={3} />
                                          <span>Terpilih (Lepas)</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn-apply-product"
                                          onClick={() => handleSelectProduct(item, prod)}
                                          disabled={isReadOnly}
                                          title="Pilih produk ini untuk dimasukkan ke seserahan Anda"
                                        >
                                          {hasAnySelected ? 'Ganti ke produk ini' : 'Pilih produk'}
                                        </button>
                                      )}

                                      <a
                                        href={prod.link}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="btn-store-link"
                                        title="Buka katalog produk di toko online"
                                      >
                                        <span>Lihat produk</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: REKOMENDASI (Compact, Clean & Non-AI Look) */}
        <div className="seserahan-rekomendasi-card">
          <div className="seserahan-rekomendasi-header">
            <h3>REKOMENDASI</h3>
            <p>Pilih seserahan lebih mudah di sini</p>
          </div>

          {/* Minimalist Category Filter Pills */}
          <div className="rec-category-bar">
            {SESERAHAN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`rec-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* List Rekomendasi Compact & Rapi */}
          <div className="rec-items-stack">
            {availableRecommendations.length === 0 ? (
              <div className="rec-empty-state">
                <p>Semua rekomendasi telah ditambahkan ke daftar seserahan Anda</p>
              </div>
            ) : (
              displayedRecs.map((rec) => (
                <div key={rec.id} className="rec-single-card">
                  <div className="rec-card-info">
                    <span className="rec-card-title">{rec.title}</span>
                    <span className="rec-card-category">{rec.categoryName}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-add-rec"
                    onClick={() => handleAddRecommendation(rec)}
                    disabled={isReadOnly}
                    title={`Tambahkan ${rec.title} ke daftar seserahan`}
                  >
                    + Tambah
                  </button>
                </div>
              ))
            )}

            {/* Tombol Tampilkan Lebih Banyak */}
            {availableRecommendations.length > 8 && (
              <button
                type="button"
                className="btn-toggle-recs"
                onClick={() => setShowAllRecs(!showAllRecs)}
              >
                {showAllRecs ? (
                  <>
                    Tampilkan Lebih Sedikit <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Tampilkan Lebih Banyak ({availableRecommendations.length - 8}+) <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Seserahan Baru */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '460px', width: '90%' }}>
            <button onClick={() => setShowAddModal(false)} className="modal-close">
              ×
            </button>
            <h3 style={{ marginBottom: '16px' }}>Tambah Barang Seserahan</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Barang Seserahan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mukena, Sajadah, Jam Tangan"
                  value={addForm.title}
                  onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Nama Brand / Toko (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Tazbiya, Howel and Co, Casio"
                  value={addForm.brand}
                  onChange={e => setAddForm({ ...addForm, brand: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Estimasi Harga (Rp) (Opsional)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 250.000"
                  value={addForm.price}
                  onChange={e => setAddForm({ ...addForm, price: formatThousand(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Link Produk / Toko Online (Opsional)</label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="https://... (link produk / toko online)"
                  value={addForm.link}
                  onChange={e => setAddForm({ ...addForm, link: cleanUrlInput(e.target.value) })}
                  onPaste={e => {
                    const text = e.clipboardData?.getData('text');
                    if (text) {
                      const extracted = cleanUrlInput(text);
                      if (extracted && extracted !== text) {
                        e.preventDefault();
                        setAddForm({ ...addForm, link: extracted });
                      }
                    }
                  }}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Seserahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Seserahan */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '460px', width: '90%' }}>
            <button onClick={() => setEditingItem(null)} className="modal-close">
              ×
            </button>
            <h3 style={{ marginBottom: '16px' }}>Ubah Barang Seserahan</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Barang Seserahan *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Nama Brand / Toko</label>
                <input
                  type="text"
                  placeholder="Contoh: Tazbiya, Howel and Co"
                  value={editForm.brand}
                  onChange={e => setEditForm({ ...editForm, brand: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Estimasi Harga (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 250.000"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: formatThousand(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Link Produk / Toko Online</label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="https://... (link produk / toko online)"
                  value={editForm.link}
                  onChange={e => setEditForm({ ...editForm, link: cleanUrlInput(e.target.value) })}
                  onPaste={e => {
                    const text = e.clipboardData?.getData('text');
                    if (text) {
                      const extracted = cleanUrlInput(text);
                      if (extracted && extracted !== text) {
                        e.preventDefault();
                        setEditForm({ ...editForm, link: extracted });
                      }
                    }
                  }}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Masukkan ke Budgeting */}
      {showSyncModal && (
        <div className="modal-overlay seserahan-modal-overlay">
          <div className="card modal-card seserahan-sync-modal" style={{ maxWidth: '480px', width: '92%' }}>
            <button
              onClick={() => !isSyncing && setShowSyncModal(false)}
              className="modal-close"
              disabled={isSyncing}
            >
              ×
            </button>

            <div className="seserahan-sync-modal-header">
              <div className="seserahan-modal-icon-badge">
                <Wallet size={22} />
              </div>
              <div>
                <h3>Masukkan ke Budgeting</h3>
                <p>Sinkronkan total estimasi seserahan ke pos rencana anggaran</p>
              </div>
            </div>

            {/* Total Highlight Card */}
            <div className="seserahan-sync-summary-box">
              <span className="sync-summary-label">Total Estimasi Seserahan</span>
              <span className="sync-summary-nominal">{formatCurrency(totalEstimatedCost)}</span>
              <span className="sync-summary-meta">Dihitung dari {pricedCount} item yang memiliki estimasi harga</span>
            </div>

            {/* Select Budget Plan */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '6px', display: 'block' }}>
                Pilih Target Plan Anggaran
              </label>
              <select
                className="form-input"
                value={selectedPlanId}
                onChange={e => setSelectedPlanId(e.target.value)}
                disabled={isSyncing}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.92rem' }}
              >
                {availablePlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.id === activePlanId ? '(Sedang Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Detection Box */}
            {existingExpenseInSelectedPlan ? (
              <div className="seserahan-sync-detected-card">
                <div className="detected-badge">
                  <CheckCircle2 size={15} />
                  <span>Pos 'Seserahan' Terdeteksi di Plan Ini</span>
                </div>
                <p className="detected-desc">
                  Ditemukan pos <strong>"{existingExpenseInSelectedPlan.title || 'Seserahan'}"</strong> dengan rencana saat ini <strong>{formatCurrency(existingExpenseInSelectedPlan.planned_amount || existingExpenseInSelectedPlan.amount)}</strong>.
                </p>

                <div className="sync-option-group">
                  <label className={`sync-option-label ${syncOption === 'update' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="syncOption"
                      value="update"
                      checked={syncOption === 'update'}
                      onChange={() => setSyncOption('update')}
                      disabled={isSyncing}
                    />
                    <div>
                      <strong>Perbarui pos yang sudah ada (Rekomendasi)</strong>
                      <span className="opt-sub">Nominal rencana diubah menjadi {formatCurrency(totalEstimatedCost)}</span>
                    </div>
                  </label>

                  <label className={`sync-option-label ${syncOption === 'new' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="syncOption"
                      value="new"
                      checked={syncOption === 'new'}
                      onChange={() => setSyncOption('new')}
                      disabled={isSyncing}
                    />
                    <div>
                      <strong>Buat pos pengeluaran 'Seserahan' baru</strong>
                      <span className="opt-sub">Menambahkan baris baru terpisah di daftar pengeluaran</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="seserahan-sync-info-box">
                <div className="info-title">
                  <Sparkles size={15} />
                  <span>Pos Anggaran Baru Akan Dibuat</span>
                </div>
                <p className="info-text">
                  Kategori <strong>'Seserahan'</strong> belum tercatat di plan ini. Amara akan membuatkan pos baru:
                </p>
                <div className="new-item-preview">
                  <div className="preview-row"><span>Kategori:</span><strong>Seserahan</strong></div>
                  <div className="preview-row"><span>Keterangan:</span><strong>Paket Seserahan</strong></div>
                  <div className="preview-row"><span>Rencana Biaya:</span><strong>{formatCurrency(totalEstimatedCost)}</strong></div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="btn-secondary"
                disabled={isSyncing}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSync}
                className="btn-primary"
                disabled={isSyncing}
              >
                {isSyncing ? 'Menyimpan...' : 'Konfirmasi & Masukkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingItem && (
        <div className="modal-overlay confirm-modal-overlay">
          <div className="card modal-card confirm-modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <button onClick={() => setDeletingItem(null)} className="modal-close">
              ×
            </button>
            <h3 style={{ marginBottom: '10px' }}>Hapus Barang Seserahan</h3>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px' }}>
              Apakah Anda yakin ingin menghapus <strong>"{deletingItem.title}"</strong> dari daftar seserahan?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setDeletingItem(null)} className="btn-secondary">
                Batal
              </button>
              <button type="button" onClick={confirmDelete} className="btn-primary" style={{ backgroundColor: '#99182A' }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seserahan;
