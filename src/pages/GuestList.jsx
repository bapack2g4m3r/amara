import { useState, useRef } from 'react';
import { Plus, Search, Users, User, Star, X, Trash2, Upload, FileSpreadsheet, Info, Edit2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/GuestList.css';

const GuestList = () => {
  const { guests, addGuest, deleteGuest, updateGuest } = useWeddingStore();
  const { t, language } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const fileInputRef = useRef(null);
  
  const [editingGuestId, setEditingGuestId] = useState(null);
  
  const initialFormState = {
    name: '',
    category: 'Tamu CPW',
    pax: 1,
    guest_type: 'Keluarga'
  };
  const [guestForm, setGuestForm] = useState(initialFormState);

  // --- Bulk Upload Logic ---
  const parseBulkFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const lines = content.split('\n').filter(l => l.trim() !== '');
        const parsed = [];
        // Skip header row if detected
        const startIdx = (lines[0] && lines[0].toLowerCase().includes('nama')) ? 1 : 0;
        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].split(',');
          const name = (parts[0] || '').trim();
          let category = (parts[1] || 'Tamu CPW').trim();
          const pax = Number(parts[2]) || 1;
          if (name) {
            parsed.push({ name, category, pax });
          }
        }
        resolve(parsed);
      };
      reader.readAsText(file);
    });
  };

  const handleBulkFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFileName(file.name);
    const parsed = await parseBulkFile(file);
    setBulkPreview(parsed);
    setShowBulkConfirm(true);
    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBulkConfirmUpload = async () => {
    for (const guest of bulkPreview) {
      await addGuest({
        name: guest.name,
        category: guest.category,
        pax: guest.pax,
        guest_type: 'Keluarga' // Default type for bulk
      });
    }
    setShowBulkConfirm(false);
    setShowBulkModal(false);
    setBulkPreview([]);
    setBulkFileName('');
  };

  // --- Save / Add / Edit Guest ---
  const handleSaveGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.name) return;
    
    const payload = {
      name: guestForm.name,
      category: guestForm.category,
      pax: Number(guestForm.pax),
      guest_type: guestForm.guest_type
    };

    if (editingGuestId) {
      await updateGuest(editingGuestId, payload);
    } else {
      await addGuest(payload);
    }
    
    closeModal();
  };

  // Helper to dynamically display translation
  const displayCategory = (category) => {
    if (!category) return '-';
    const catLower = category.toLowerCase();
    if (catLower.includes('cpw') || catLower.includes('bride')) {
      return t('guestList.cpwLabel');
    }
    if (catLower.includes('cpp') || catLower.includes('groom')) {
      return t('guestList.cppLabel');
    }
    return category;
  };

  const displayGuestType = (type) => {
    if (!type) return '-';
    const typeLower = type.toLowerCase();
    if (typeLower === 'keluarga' || typeLower === 'family') {
      return language === 'id' ? 'Keluarga' : 'Family';
    }
    if (typeLower === 'teman' || typeLower === 'friend') {
      return language === 'id' ? 'Teman' : 'Friend';
    }
    return type; // VIP, dsb.
  };

  // Helper to normalize values for the edit form state
  const normalizeCategory = (cat) => {
    if (!cat) return 'Tamu CPW';
    const c = cat.toLowerCase();
    if (c.includes('cpw') || c.includes('bride')) return 'Tamu CPW';
    if (c.includes('cpp') || c.includes('groom')) return 'Tamu CPP';
    return cat;
  };

  const normalizeGuestType = (type) => {
    if (!type) return 'Keluarga';
    const t = type.toLowerCase();
    if (t === 'keluarga' || t === 'family') return 'Keluarga';
    if (t === 'teman' || t === 'friend') return 'Teman';
    return type;
  };

  const handleEditGuestClick = (guest) => {
    setGuestForm({
      name: guest.name || '',
      category: normalizeCategory(guest.category),
      pax: guest.pax || 1,
      guest_type: normalizeGuestType(guest.guest_type)
    });
    setEditingGuestId(guest.id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setGuestForm(initialFormState);
    setEditingGuestId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGuestId(null);
    setGuestForm(initialFormState);
  };

  // --- Stats ---
  const cpwCount = guests.filter(g => (g.category || '').includes('CPW') || (g.category || '').includes('Bride')).reduce((acc, g) => acc + (g.pax || 0), 0);
  const cppCount = guests.filter(g => (g.category || '').includes('CPP') || (g.category || '').includes('Groom')).reduce((acc, g) => acc + (g.pax || 0), 0);
  const totalCpwp = cpwCount + cppCount;
  
  const vipCount = guests.filter(g => (g.guest_type || '').includes('VIP')).reduce((acc, g) => acc + (g.pax || 0), 0);
  const regularPax = guests.filter(g => (g.guest_type || '') === 'Keluarga' || (g.guest_type || '') === 'Teman' || (g.guest_type || '').includes('Family') || (g.guest_type || '').includes('Friend')).reduce((acc, g) => acc + (g.pax || 0), 0);

  // --- Filtering ---
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchFilter = true;
    if (activeFilter === 'vip') {
      matchFilter = (g.guest_type || '').includes('VIP');
    } else if (activeFilter === 'regular') {
      matchFilter = (g.guest_type || '').includes('Keluarga') || (g.guest_type || '').includes('Teman') || (g.guest_type || '').includes('Family') || (g.guest_type || '').includes('Friend');
    }
    return matchSearch && matchFilter;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getGuestTypeColor = (type) => {
    if (!type) return 'bg-purple';
    if (type.includes('VIP')) return 'bg-gold';
    if (type.includes('Keluarga') || type.includes('Family')) return 'bg-blue';
    if (type.includes('Teman') || type.includes('Friend')) return 'bg-green';
    return 'bg-purple';
  };

  const getCategoryBadgeClass = (category) => {
    if (!category) return 'badge-category';
    if (category.includes('CPW') || category.includes('Bride')) return 'badge-category cpw';
    if (category.includes('CPP') || category.includes('Groom')) return 'badge-category cpp';
    return 'badge-category';
  };

  // Filter pill labels with translations
  const filterOptions = [
    { key: 'all', label: t('guestList.allGuests') },
    { key: 'regular', label: t('guestList.regular') },
    { key: 'vip', label: 'VIP' }
  ];

  return (
    <div className="guest-list-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>{t('guestList.title')}</h1>
          <p className="subtitle">{t('guestList.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-secondary btn-bulk" onClick={() => setShowBulkModal(true)}>
            <Upload size={16} /> {t('guestList.bulkUpload')}
          </button>
          <button className="btn-primary btn-add-guest" onClick={openAddModal}>
            <Plus size={18} /> {t('guestList.addGuest')}
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="guest-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-purple"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.regularPax')}</span>
            <span className="stat-value">{regularPax}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-gold"><Star size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.vipPax')}</span>
            <span className="stat-value">{vipCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-pink"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.cpwLabel')}</span>
            <span className="stat-value">{cpwCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-indigo"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.cppLabel')}</span>
            <span className="stat-value">{cppCount}</span>
          </div>
        </div>
        <div className="card stat-card stat-card-highlight">
          <div className="stat-icon bg-teal"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.totalCpwCpp')}</span>
            <span className="stat-value">{totalCpwp}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('guestList.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {filterOptions.map(filter => (
            <span 
              key={filter.key} 
              className={`pill ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </span>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <div className="guest-table-container">
        <table className="guest-table">
          <thead>
            <tr>
              <th>{t('guestList.name')}</th>
              <th>{(t('guestList.category') || 'CATEGORY').toUpperCase()}</th>
              <th>{(t('guestList.guestType') || 'TYPE').toUpperCase()}</th>
              <th className="text-right">PAX</th>
              <th className="text-right">{t('guestList.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map(guest => (
              <tr key={guest.id}>
                <td>
                  <div className="guest-user-info">
                    <div className={`avatar ${getGuestTypeColor(guest.guest_type)}`}>{getInitials(guest.name)}</div>
                    <div className="user-details">
                      <span className="user-name">{guest.name}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={getCategoryBadgeClass(guest.category)}>
                    {displayCategory(guest.category)}
                  </span>
                </td>
                <td><span className="badge-type">{displayGuestType(guest.guest_type)}</span></td>
                <td className="text-right">{guest.pax}</td>
                <td className="text-right" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => handleEditGuestClick(guest)} className="btn-icon" title="Edit" style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteGuest(guest.id)} className="btn-icon-danger" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredGuests.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>{t('guestList.noGuests')}</p>
        )}
      </div>

      {/* Add Guest Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <button onClick={closeModal} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{editingGuestId ? t('guestList.editGuest') : t('guestList.addGuest')}</h3>
            <form onSubmit={handleSaveGuest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{t('guestList.guestName')}</label>
                <input type="text" value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} required className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{t('guestList.category')}</label>
                  <select value={guestForm.category} onChange={e => setGuestForm({...guestForm, category: e.target.value})} className="form-input">
                    <option value="Tamu CPW">{t('guestList.cpwLabel')}</option>
                    <option value="Tamu CPP">{t('guestList.cppLabel')}</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{t('guestList.totalPax')}</label>
                  <input type="number" min="1" value={guestForm.pax} onChange={e => setGuestForm({...guestForm, pax: e.target.value})} required className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">{t('guestList.guestType')}</label>
                <select value={guestForm.guest_type} onChange={e => setGuestForm({...guestForm, guest_type: e.target.value})} className="form-input">
                  <option value="Keluarga">{language === 'id' ? 'Keluarga' : 'Family'}</option>
                  <option value="Teman">{language === 'id' ? 'Teman' : 'Friend'}</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <button onClick={() => { setShowBulkModal(false); setBulkPreview([]); setBulkFileName(''); }} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={22} /> {t('guestList.bulkUpload')}
            </h3>
            
            {/* Instructions */}
            <div className="bulk-instructions">
              <div className="bulk-info-header">
                <Info size={16} /> <strong>{t('guestList.bulkHowTo')}</strong>
              </div>
              <ol>
                <li>{t('guestList.bulkStep1')}</li>
                <li>{t('guestList.bulkStep2')}</li>
                <li>{t('guestList.bulkStep3')}</li>
              </ol>
              <div className="bulk-example">
                <strong>{t('guestList.bulkExample')}:</strong>
                <code>
                  Nama, Kategori, Pax<br/>
                  Budi Santoso, Tamu CPP, 3<br/>
                  Anita Dewi, Tamu CPW, 2
                </code>
              </div>
            </div>

            <div className="bulk-upload-area" onClick={() => fileInputRef.current?.click()}>
              <Upload size={32} />
              <p>{bulkFileName || t('guestList.bulkClickToUpload')}</p>
              <span className="bulk-formats">.csv, .xlsx</span>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              onChange={handleBulkFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Bulk Upload Confirmation */}
      {showBulkConfirm && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <button onClick={() => { setShowBulkConfirm(false); setBulkPreview([]); }} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '15px' }}>{t('guestList.bulkConfirmTitle')}</h3>
            <p style={{ marginBottom: '10px', color: 'var(--color-text-muted)' }}>
              {bulkPreview.length} {t('guestList.bulkConfirmDesc')}
            </p>
            <div className="bulk-preview-table">
              <table className="guest-table">
                <thead>
                  <tr>
                    <th>{t('guestList.name')}</th>
                    <th>{t('guestList.category')}</th>
                    <th className="text-right">Pax</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPreview.slice(0, 10).map((g, idx) => (
                    <tr key={idx}>
                      <td>{g.name}</td>
                      <td>{g.category}</td>
                      <td className="text-right">{g.pax}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bulkPreview.length > 10 && (
                <p style={{ textAlign: 'center', padding: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  ...{t('guestList.bulkAndMore')}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => { setShowBulkConfirm(false); setBulkPreview([]); }}>
                {t('activities.cancel')}
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={handleBulkConfirmUpload}>
                {t('guestList.bulkConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
