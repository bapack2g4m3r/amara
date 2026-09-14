import { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { getStoredAffiliates, SESERAHAN_CATEGORIES, findAffiliateRecommendation } from '../data/seserahanAffiliates';
import { formatThousand, parseThousand } from '../utils/currencyFormatter';
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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
      link: addForm.link.trim()
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
      price: item.price > 0 ? item.price : (prod.price || 0),
      link: prod.link
    });
    showToast(`Produk "${prod.brand}" berhasil dipilih!`);
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
      link: editForm.link.trim()
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
        </div>
      )}

      {/* Header */}
      <header className="page-header seserahan-page-header">
        <div>
          <h1>Daftar Seserahan</h1>
          <p className="subtitle">Rencanakan dan kelola barang seserahan pernikahan Anda</p>
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
                + Tambah
              </button>
            )}
          </div>

          <div className="seserahan-items-wrapper">
            {seserahanItems.length === 0 ? (
              <div className="seserahan-empty-state">
                <ShoppingBag size={34} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '8px' }} />
                <p>Belum ada daftar seserahan. Klik <strong>+ Tambah</strong> atau pilih dari rekomendasi di samping.</p>
              </div>
            ) : (
              seserahanItems.map((item) => {
                const affiliateMatch = findAffiliateRecommendation(item.title);
                const isExpanded = !!expandedRecItemIds[item.id];

                return (
                  <div
                    key={item.id}
                    className={`seserahan-item-block ${item.is_bought ? 'is-bought' : ''}`}
                  >
                    {/* Main Row */}
                    <div className="seserahan-main-row">
                      <div className="seserahan-row-left">
                        <button
                          type="button"
                          className={`seserahan-checkbox ${item.is_bought ? 'checked' : ''}`}
                          onClick={() => !isReadOnly && toggleSeserahanItem(item.id)}
                          title={isReadOnly ? 'Akses Lihat Saja' : item.is_bought ? 'Tandai belum dibeli' : 'Tandai sudah dibeli'}
                          disabled={isReadOnly}
                        >
                          {item.is_bought && <Check size={13} strokeWidth={3} />}
                        </button>

                        <div className="seserahan-item-content">
                          <div className="seserahan-item-headline">
                            <span className={`seserahan-item-title ${item.is_bought ? 'bought' : ''}`}>
                              {item.title}
                            </span>
                            {item.badge_label && (
                              <span className="seserahan-item-badge">Rekomendasi</span>
                            )}
                          </div>

                          {/* Info baris: Brand, Harga, Link (Clean inline layout) */}
                          {(item.brand || item.price > 0 || item.link) && (
                            <div className="seserahan-item-subline">
                              {item.brand && (
                                <span className="seserahan-sub-brand">{item.brand}</span>
                              )}
                              {item.price > 0 && (
                                <span className="seserahan-sub-price">{formatCurrency(item.price)}</span>
                              )}
                              {item.link && (
                                <a
                                  href={formatUrl(item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                  className="seserahan-sub-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Lihat Link <ExternalLink size={10} />
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
                          className={`seserahan-accordion-trigger ${isExpanded ? 'open' : ''}`}
                          onClick={() => toggleAccordion(item.id)}
                        >
                          <span className="accordion-trigger-text">
                            {affiliateMatch.products.length} Rekomendasi Produk Pilihan
                          </span>
                          <span className="accordion-trigger-chevron">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="seserahan-product-list">
                            {affiliateMatch.products.map((prod) => (
                              <div key={prod.id} className="seserahan-product-card">
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

                                  <div className="product-price-row">
                                    <a
                                      href={prod.link}
                                      target="_blank"
                                      rel="noopener noreferrer nofollow"
                                      className="product-price-hyperlink"
                                      title="Cek harga & diskon produk ini langsung di Shopee"
                                    >
                                      <span>Cek harga produk di sini</span>
                                      <ExternalLink size={12} className="hyperlink-icon" />
                                    </a>
                                  </div>

                                  <div className="product-button-row">
                                    <button
                                      type="button"
                                      className="btn-apply-product"
                                      onClick={() => handleSelectProduct(item, prod)}
                                      disabled={isReadOnly}
                                      title="Pilih produk ini untuk dimasukkan ke seserahan Anda"
                                    >
                                      Pilih produk
                                    </button>
                                    <a
                                      href={prod.link}
                                      target="_blank"
                                      rel="noopener noreferrer nofollow"
                                      className="btn-store-link"
                                      title="Buka katalog produk di Shopee"
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
                  type="url"
                  placeholder="https://... (link produk / toko online)"
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
