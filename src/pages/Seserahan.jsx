import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, Sparkles, X } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Seserahan.css';

const RECOMMENDATION_SUGGESTIONS = [
  'Piyama couple',
  'Skincare',
  'Perhiasan',
  'Perlengkapan Mandi',
  'Parfum & Kosmetik',
  'Pakaian Dalam',
  'Tas & Sepatu'
];

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
  const [newTitleInput, setNewTitleInput] = useState('');

  const [editingItem, setEditingItem] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  const [deletingItem, setDeletingItem] = useState(null);

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
    const trimmed = newTitleInput.trim();
    if (!trimmed) return;

    addSeserahanItem(trimmed);
    setNewTitleInput('');
    setShowAddModal(false);
  };

  const handleAddRecommendation = (recName) => {
    if (isReadOnly) return;
    addSeserahanItem(recName, '✨ Rekomendasi Produk Terbaik');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly || !editingItem) return;
    const trimmed = editTitleInput.trim();
    if (!trimmed) return;

    updateSeserahanItem(editingItem.id, trimmed);
    setEditingItem(null);
    setEditTitleInput('');
  };

  const confirmDelete = () => {
    if (isReadOnly || !deletingItem) return;
    deleteSeserahanItem(deletingItem.id);
    setDeletingItem(null);
  };

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
                  </div>

                  {!isReadOnly && (
                    <div className="seserahan-item-actions">
                      <button
                        type="button"
                        className="btn-seserahan-action"
                        title="Ubah Nama"
                        onClick={() => {
                          setEditingItem(item);
                          setEditTitleInput(item.title);
                        }}
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
            {RECOMMENDATION_SUGGESTIONS.map((rec) => (
              <button
                key={rec}
                type="button"
                className="rekomendasi-item-btn"
                onClick={() => handleAddRecommendation(rec)}
                disabled={isReadOnly}
                title={isReadOnly ? 'Akses Lihat Saja' : `Klik untuk menambahkan ${rec}`}
              >
                <Plus size={18} className="rekomendasi-icon" />
                <span>{rec}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Tambah Seserahan Baru */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: '420px', width: '90%' }}>
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
                  placeholder="Contoh: Set Perhiasan, Mukena Sutra"
                  value={newTitleInput}
                  onChange={e => setNewTitleInput(e.target.value)}
                  className="form-input"
                  autoFocus
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
          <div className="card modal-card" style={{ maxWidth: '420px', width: '90%' }}>
            <button onClick={() => setEditingItem(null)} className="modal-close">
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '16px' }}>Ubah Barang Seserahan</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={editTitleInput}
                  onChange={e => setEditTitleInput(e.target.value)}
                  className="form-input"
                  autoFocus
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
