import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, Sparkles, X, ExternalLink, Tag, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Seserahan.css';

const ALL_RECOMMENDATIONS = [
  { title: 'Set Perhiasan & Logam Mulia', brand: 'Frank & Co / Semar Nusantara' },
  { title: 'Perlengkapan Ibadah (Mukena / Sajadah)', brand: 'Siti Khadijah / Atlas' },
  { title: 'Set Skincare & Perawatan Wajah', brand: 'Somethinc / Avoskin / SK-II' },
  { title: 'Parfum & Wewangian', brand: 'Jo Malone / HMNS / Chanel' },
  { title: 'Tas & Sepatu Pesta', brand: 'Charles & Keith / Pedro / Coach' },
  { title: 'Piyama Couple Sutra', brand: 'Marks & Spencer / Sleepwear' },
  { title: 'Pakaian Dalam (Lingerie / Underwear)', brand: 'Wacoal / Triumph' },
  { title: 'Perlengkapan Mandi & Body Care', brand: 'The Body Shop / L\'Occitane' },
  { title: 'Jam Tangan Eksklusif', brand: 'Fossil / Daniel Wellington' },
  { title: 'Set Makeup Lengkap', brand: 'Make Over / MAC / Dior' },
  { title: 'Koper & Travel Bag', brand: 'Samsonite / American Tourister' },
  { title: 'Kain Batik / Bahan Kebaya Premium', brand: 'Batik Danar Hadi' },
  { title: 'Sepatu Formal / Heels', brand: 'Mario Minardi / Everbest' },
  { title: 'Dompet & Aksesoris Kulit', brand: 'Fossil / Braun Buffel' }
];

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

  // Calculations
  const totalCount = seserahanItems.length;
  const boughtCount = useMemo(() => {
    return seserahanItems.filter(item => item.is_bought).length;
  }, [seserahanItems]);

  const percent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

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

  const handleAddRecommendation = (rec) => {
    if (isReadOnly) return;
    addSeserahanItem({
      title: rec.title,
      brand: rec.brand,
      badge_label: '✨ Rekomendasi'
    });
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

  const displayedRecs = showAllRecs ? ALL_RECOMMENDATIONS : ALL_RECOMMENDATIONS.slice(0, 6);

  return (
    <div className="seserahan-container">
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
              seserahanItems.map((item) => (
                <div
                  key={item.id}
                  className={`seserahan-item-card ${item.is_bought ? 'bought' : ''}`}
                >
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
                            rel="noopener noreferrer"
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
              ))
            )}
          </div>
        </div>

        {/* Right Column: REKOMENDASI */}
        <div className="seserahan-rekomendasi-card">
          <div className="seserahan-rekomendasi-header">
            <h3>REKOMENDASI</h3>
            <p>Pilih seserahan lebih mudah di sini</p>
          </div>

          <div className="rekomendasi-list">
            {displayedRecs.map((rec) => (
              <button
                key={rec.title}
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
                  {rec.brand && (
                    <span className="rekomendasi-brand-hint">{rec.brand}</span>
                  )}
                </div>
              </button>
            ))}

            {/* Tombol Tampilkan Lebih Banyak */}
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
                  Tampilkan Lebih Banyak ({ALL_RECOMMENDATIONS.length - 6}+) <ChevronDown size={16} />
                </>
              )}
            </button>
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
                  placeholder="Contoh: Set Perhiasan Emas, Mukena Sutra"
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
                  placeholder="Contoh: Frank & Co, Zara, Sephora"
                  value={addForm.brand}
                  onChange={e => setAddForm({ ...addForm, brand: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Estimasi Harga (Rp) (Opsional)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
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
                  placeholder="https://shopee.co.id/produk-... atau tokopedia.com/..."
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
                  placeholder="Contoh: Frank & Co, Zara, Sephora"
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
