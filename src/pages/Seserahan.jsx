import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, Sparkles, X, ExternalLink, Tag, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { SESERAHAN_AFFILIATES, SESERAHAN_CATEGORIES, findAffiliateRecommendation } from '../data/seserahanAffiliates';
import '../styles/Seserahan.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatUrl = (url) => {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const Seserahan = () => {
  const {
    seserahanItems = [],
    addSeserahanItem,
    toggleSeserahanItem,
    updateSeserahanItem,
    deleteSeserahanItem,
    userRole
  } = useWeddingStore();

  const isReadOnly = userRole === 'viewer';

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

  // State accordion item seserahan mana yang sedang dibuka rekomendasi produknya
  const [expandedRecItemIds, setExpandedRecItemIds] = useState({});

  // Toast notification for choosing a product
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleAccordion = (itemId) => {
    setExpandedRecItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculations
  const totalCount = seserahanItems.length;
  const boughtCount = useMemo(() => {
    return seserahanItems.filter(item => item.is_bought).length;
  }, [seserahanItems]);

  const percent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  // Deteksi affiliate mana saja yang sudah dipilih ke dalam seserahanItems
  const addedAffiliateIds = useMemo(() => {
    const ids = new Set();
    seserahanItems.forEach(item => {
      const match = findAffiliateRecommendation(item.title);
      if (match) {
        ids.add(match.id);
      } else {
        const direct = SESERAHAN_AFFILIATES.find(a => a.title.toLowerCase() === item.title.toLowerCase());
        if (direct) ids.add(direct.id);
      }
    });
    return ids;
  }, [seserahanItems]);

  // Rekomendasi yang BELUM dipilih oleh user (otomatis menghilang jika sudah ada di daftar seserahan)
  const availableRecommendations = useMemo(() => {
    return SESERAHAN_AFFILIATES.filter(rec => {
      // 1. Cek apakah sudah ditambahkan
      if (addedAffiliateIds.has(rec.id)) return false;
      // 2. Filter kategori jika dipilih
      if (activeCategory !== 'all' && rec.category !== activeCategory) return false;
      return true;
    });
  }, [addedAffiliateIds, activeCategory]);

  const displayedRecs = showAllRecs ? availableRecommendations : availableRecommendations.slice(0, 7);

  // Handlers
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    const trimmed = addForm.title.trim();
    if (!trimmed) return;

    addSeserahanItem({
      title: trimmed,
      brand: addForm.brand.trim(),
      price: Number(addForm.price) || 0,
      link: addForm.link.trim()
    });

    setAddForm({ title: '', brand: '', price: '', link: '' });
    setShowAddModal(false);
  };

  // Menambahkan item dari rekomendasi di kolom kanan ke kolom kiri (otomatis hilang dari kolom kanan)
  const handleAddRecommendation = (rec) => {
    if (isReadOnly) return;
    addSeserahanItem({
      title: rec.title,
      badge_label: '✨ Rekomendasi'
    });
    showToast(`"${rec.title}" ditambahkan ke daftar seserahan`);
  };

  // Memilih produk spesifik dari list rekomendasi Shopee affiliate
  const handleSelectProduct = (item, prod) => {
    if (isReadOnly) return;
    updateSeserahanItem(item.id, {
      brand: prod.brand,
      price: prod.price,
      link: prod.link
    });
    showToast(`Produk "${prod.name}" berhasil dipilih!`);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      brand: item.brand || '',
      price: item.price ? String(item.price) : '',
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
      price: Number(editForm.price) || 0,
      link: editForm.link.trim()
    });

    setEditingItem(null);
    setEditForm({ title: '', brand: '', price: '', link: '' });
  };

  const confirmDelete = () => {
    if (isReadOnly || !deletingItem) return;
    deleteSeserahanItem(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="seserahan-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="seserahan-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="page-header seserahan-page-header">
        <div>
          <h1>Daftar Seserahan</h1>
          <p className="subtitle">Pastikan tidak ada seserahan Anda yang terlewat</p>
        </div>
      </header>

      {/* Progress Seserahan Card */}
      <div className="seserahan-progress-card">
        <div className="seserahan-progress-header">
          <h3>Progress Seserahan</h3>
          <span className="seserahan-progress-meta">
            {boughtCount} dari {totalCount} item telah dibeli
          </span>
        </div>

        <p className="seserahan-progress-percent">{percent}%</p>

        <div className="seserahan-progress-track">
          <div
            className="seserahan-progress-fill"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="seserahan-main-grid">
        {/* Left Column: DAFTAR SESERAHAN */}
        <div className="seserahan-list-card">
          <div className="seserahan-list-header">
            <h2>DAFTAR SESERAHAN</h2>
            {!isReadOnly && (
              <button
                type="button"
                className="btn-tambah-seserahan"
                onClick={() => setShowAddModal(true)}
              >
                + TAMBAH
              </button>
            )}
          </div>

          <div className="seserahan-items-wrapper">
            {seserahanItems.length === 0 ? (
              <div className="seserahan-empty-state">
                <ShoppingBag size={38} style={{ color: 'var(--color-primary)', opacity: 0.6, marginBottom: '10px' }} />
                <p>Belum ada daftar seserahan. Klik <strong>+ TAMBAH</strong> atau pilih dari rekomendasi di samping.</p>
              </div>
            ) : (
              seserahanItems.map((item) => {
                const affiliateMatch = findAffiliateRecommendation(item.title);
                const isExpanded = !!expandedRecItemIds[item.id];

                return (
                  <div
                    key={item.id}
                    className={`seserahan-item-block ${item.is_bought ? 'bought' : ''}`}
                  >
                    <div className="seserahan-item-card">
                      <div className="seserahan-item-left">
                        <div
                          className={`seserahan-checkbox ${item.is_bought ? 'checked' : ''}`}
                          onClick={() => !isReadOnly && toggleSeserahanItem(item.id)}
                          title={isReadOnly ? 'Akses Lihat Saja' : item.is_bought ? 'Tandai belum dibeli' : 'Tandai sudah dibeli'}
                        >
                          {item.is_bought && <Check size={14} strokeWidth={3} />}
                        </div>

                        <div className="seserahan-item-info">
                          <div className="seserahan-title-row">
                            <h4 className={`seserahan-item-title ${item.is_bought ? 'bought' : ''}`}>
                              {item.title}
                            </h4>
                            {item.badge_label && (
                              <span className="seserahan-badge">
                                <Sparkles size={11} />
                                {item.badge_label.replace(/^✨\s*/, '')}
                              </span>
                            )}
                          </div>

                          {/* Meta information: Brand, Price, Product Link */}
                          <div className="seserahan-meta-row">
                            {item.brand && (
                              <span className="seserahan-meta-pill brand" title="Nama Brand / Toko">
                                <Tag size={12} /> {item.brand}
                              </span>
                            )}

                            {item.price > 0 && (
                              <span className="seserahan-meta-pill price" title="Harga">
                                {formatCurrency(item.price)}
                              </span>
                            )}

                            {item.link && (
                              <a
                                href={formatUrl(item.link)}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="seserahan-meta-link"
                                title="Buka Link Produk"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={12} /> Link Produk
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="seserahan-item-actions">
                          <button
                            type="button"
                            className="btn-seserahan-action"
                            title="Ubah Detail"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-seserahan-action delete"
                            title="Hapus Barang"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion Bar Rekomendasi Produk (Persis seperti referensi kompetitor) */}
                    {affiliateMatch && affiliateMatch.products && affiliateMatch.products.length > 0 && (
                      <div className="seserahan-rec-wrapper">
                        <button
                          type="button"
                          className={`seserahan-rec-bar ${isExpanded ? 'active' : ''}`}
                          onClick={() => toggleAccordion(item.id)}
                        >
                          <span className="rec-bar-title">
                            <Sparkles size={14} className="sparkle-icon" />
                            {affiliateMatch.products.length} rekomendasi produk
                          </span>
                          <span className="rec-bar-chevron">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="seserahan-rec-products-grid">
                            {affiliateMatch.products.map((prod) => (
                              <div key={prod.id} className="seserahan-rec-product-card">
                                <div className="rec-product-img-box">
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

                                <div className="rec-product-info">
                                  <div className="rec-product-header">
                                    <span className={`rec-product-tier ${prod.tier === 'Premium' ? 'tier-premium' : prod.tier === 'Populer' ? 'tier-populer' : 'tier-hemat'}`}>
                                      {prod.tier}
                                    </span>
                                    <span className="rec-product-brand">{prod.brand}</span>
                                  </div>

                                  <h5 className="rec-product-title">{prod.name}</h5>

                                  <div className="rec-product-price-box">
                                    <span className="rec-product-price">{formatCurrency(prod.price)}</span>
                                  </div>

                                  <span className="rec-product-date">Harga dicek {prod.checkedDate}</span>

                                  <div className="rec-product-btn-group">
                                    <button
                                      type="button"
                                      className="btn-pilih-produk"
                                      onClick={() => handleSelectProduct(item, prod)}
                                      disabled={isReadOnly}
                                      title="Pilih dan masukkan detail produk ini ke seserahan"
                                    >
                                      Pilih produk
                                    </button>
                                    <a
                                      href={prod.link}
                                      target="_blank"
                                      rel="noopener noreferrer nofollow"
                                      className="btn-lihat-shopee"
                                      title="Buka produk di Shopee (Affiliate)"
                                    >
                                      Lihat produk
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
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

        {/* Right Column: REKOMENDASI */}
        <div className="seserahan-rekomendasi-card">
          <div className="seserahan-rekomendasi-header">
            <h3>REKOMENDASI</h3>
            <p>Pilih seserahan lebih mudah di sini</p>
          </div>

          {/* Filter Kategori Mini */}
          <div className="rekomendasi-category-chips">
            {SESERAHAN_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="rekomendasi-list">
            {availableRecommendations.length === 0 ? (
              <div className="rekomendasi-all-added">
                <CheckCircle2 size={32} className="all-added-icon" />
                <p>Semua rekomendasi telah ditambahkan ke daftar seserahan Anda ✨</p>
              </div>
            ) : (
              displayedRecs.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  className="rekomendasi-item-btn"
                  onClick={() => handleAddRecommendation(rec)}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Akses Lihat Saja' : `Klik untuk menambahkan ${rec.title}`}
                >
                  <div className="rekomendasi-item-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={16} className="rekomendasi-icon" />
                      <span className="rekomendasi-title">{rec.title}</span>
                    </div>
                  </div>
                </button>
              ))
            )}

            {/* Tombol Tampilkan Lebih Banyak jika ada sisa */}
            {availableRecommendations.length > 7 && (
              <button
                type="button"
                className="btn-toggle-recs"
                onClick={() => setShowAllRecs(!showAllRecs)}
              >
                {showAllRecs ? (
                  <>
                    Tampilkan Lebih Sedikit <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Tampilkan Lebih Banyak ({availableRecommendations.length - 7}+) <ChevronDown size={16} />
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
              <X size={20} />
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
                  type="number"
                  placeholder="Contoh: 250000"
                  value={addForm.price}
                  onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                  className="form-input"
                  min="0"
                />
              </div>

              <div>
                <label className="form-label">Link Produk / Toko Online (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://s.shopee.co.id/..."
                  value={addForm.link}
                  onChange={e => setAddForm({ ...addForm, link: e.target.value })}
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
              <X size={20} />
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
                  type="number"
                  placeholder="0"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  className="form-input"
                  min="0"
                />
              </div>

              <div>
                <label className="form-label">Link Produk / Toko Online</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.link}
                  onChange={e => setEditForm({ ...editForm, link: e.target.value })}
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

      {/* Modal Konfirmasi Hapus */}
      {deletingItem && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '400px', width: '90%' }}>
            <button onClick={() => setDeletingItem(null)} className="modal-close">
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '10px' }}>Hapus Barang Seserahan</h3>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px' }}>
              Apakah Anda yakin ingin menghapus <strong>"{deletingItem.title}"</strong> dari daftar seserahan?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setDeletingItem(null)} className="btn-secondary">
                Batal
              </button>
              <button type="button" onClick={confirmDelete} className="btn-primary" style={{ backgroundColor: '#EF4444' }}>
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
