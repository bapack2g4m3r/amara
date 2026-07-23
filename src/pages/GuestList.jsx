import { useState, useRef } from 'react';
import { Plus, Search, Users, User, Star, X, Trash2, Upload, FileSpreadsheet, Info } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/GuestList.css';

const GuestList = () => {
  const { guests, addGuest, deleteGuest } = useWeddingStore();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const fileInputRef = useRef(null);
  
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    category: 'Family',
    pax: 1,
    guest_type: ''
  });

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
          const category = (parts[1] || 'Family').trim();
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
        email: '',
        category: guest.category,
        pax: guest.pax,
        guest_type: ''
      });
    }
    setShowBulkConfirm(false);
    setShowBulkModal(false);
    setBulkPreview([]);
    setBulkFileName('');
  };

  // --- Single Add Guest ---
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.name) return;
    await addGuest({
      name: guestForm.name,
      email: guestForm.email,
      category: guestForm.category,
      pax: Number(guestForm.pax),
      guest_type: guestForm.guest_type
    });
    setShowModal(false);
    setGuestForm({ name: '', email: '', category: 'Family', pax: 1, guest_type: '' });
  };

  // --- Stats ---
  const cpwCount = guests.filter(g => g.guest_type === 'CPW').reduce((acc, g) => acc + (g.pax || 0), 0);
  const cppCount = guests.filter(g => g.guest_type === 'CPP').reduce((acc, g) => acc + (g.pax || 0), 0);
  const totalCpwp = cpwCount + cppCount;
  const vipCount = guests.filter(g => (g.category || '').includes('VIP')).reduce((acc, g) => acc + (g.pax || 0), 0);
  const regularPax = guests.filter(g => g.category === 'Family' || g.category === 'Friends').reduce((acc, g) => acc + (g.pax || 0), 0);

  // --- Filtering ---
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchFilter = true;
    if (activeFilter === 'vip') {
      matchFilter = (g.category || '').includes('VIP');
    } else if (activeFilter === 'regular') {
      matchFilter = g.category === 'Family' || g.category === 'Friends';
    }
    return matchSearch && matchFilter;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCategoryColor = (category) => {
    if (!category) return '';
    if (category.includes('VIP')) return 'bg-yellow';
    if (category.includes('Family')) return 'bg-blue';
    if (category.includes('Friends')) return 'bg-green';
    return '';
  };

  const getCategoryBadgeClass = (category) => {
    if (!category) return 'badge-category';
    if (category.includes('VIP')) return 'badge-category vip';
    return 'badge-category';
  };

  // Filter pill labels with translations
  const filterOptions = [
    { key: 'all', label: t('guestList.allGuests') || 'All Guests' },
    { key: 'regular', label: t('guestList.regular') || 'Reguler' },
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
            <Upload size={16} /> {t('guestList.bulkUpload') || 'Bulk Upload'}
          </button>
          <button className="btn-primary btn-add-guest" onClick={() => setShowModal(true)}>
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
            <span className="stat-label">{t('guestList.cpwLabel') || 'CPW'}</span>
            <span className="stat-value">{cpwCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-indigo"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.cppLabel') || 'CPP'}</span>
            <span className="stat-value">{cppCount}</span>
          </div>
        </div>
        <div className="card stat-card stat-card-highlight">
          <div className="stat-icon bg-teal"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.totalCpwCpp') || 'Total CPW/CPP'}</span>
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
                    <div className={`avatar ${getCategoryColor(guest.category)}`}>{getInitials(guest.name)}</div>
                    <div className="user-details">
                      <span className="user-name">{guest.name}</span>
                      <span className="user-email">{guest.email || '-'}</span>
                    </div>
                  </div>
                </td>
                <td><span className={getCategoryBadgeClass(guest.category)}>{guest.category}</span></td>
                <td><span className="badge-type">{guest.guest_type || '-'}</span></td>
                <td className="text-right">{guest.pax}</td>
                <td className="text-right">
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
            <button onClick={() => setShowModal(false)} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('guestList.addGuest')}</h3>
            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{t('guestList.guestName')}</label>
                <input type="text" value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} required className="form-input" />
              </div>
              <div>
                <label className="form-label">{t('guestList.emailOpt')}</label>
                <input type="email" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{t('guestList.category') || t('vendor.category')}</label>
                  <select value={guestForm.category} onChange={e => setGuestForm({...guestForm, category: e.target.value})} className="form-input">
                    <option>Family</option>
                    <option>Friends</option>
                    <option>VIP</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{t('guestList.totalPax')}</label>
                  <input type="number" min="1" value={guestForm.pax} onChange={e => setGuestForm({...guestForm, pax: e.target.value})} required className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">{t('guestList.guestType')}</label>
                <select value={guestForm.guest_type || ''} onChange={e => setGuestForm({...guestForm, guest_type: e.target.value})} className="form-input">
                  <option value="">{t('guestList.selectType')}</option>
                  <option>CPW</option>
                  <option>CPP</option>
                  <option>Teman CPW</option>
                  <option>Teman CPP</option>
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
              <FileSpreadsheet size={22} /> {t('guestList.bulkUpload') || 'Bulk Upload'}
            </h3>
            
            {/* Instructions */}
            <div className="bulk-instructions">
              <div className="bulk-info-header">
                <Info size={16} /> <strong>{t('guestList.bulkHowTo') || 'Cara Penggunaan'}</strong>
              </div>
              <ol>
                <li>{t('guestList.bulkStep1') || 'Siapkan file CSV atau Excel (.csv / .xlsx)'}</li>
                <li>{t('guestList.bulkStep2') || 'Format kolom: Nama, Kategori (Family/Friends/VIP), Jumlah Pax'}</li>
                <li>{t('guestList.bulkStep3') || 'Baris pertama bisa berupa header (akan dilewati otomatis)'}</li>
              </ol>
              <div className="bulk-example">
                <strong>{t('guestList.bulkExample') || 'Contoh'}:</strong>
                <code>
                  Nama, Kategori, Pax<br/>
                  Budi Santoso, Family, 3<br/>
                  Anita Dewi, VIP, 2<br/>
                  Rudi Hartono, Friends, 1
                </code>
              </div>
            </div>

            <div className="bulk-upload-area" onClick={() => fileInputRef.current?.click()}>
              <Upload size={32} />
              <p>{bulkFileName || (t('guestList.bulkClickToUpload') || 'Klik untuk memilih file CSV/Excel')}</p>
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
            <h3 style={{ marginBottom: '15px' }}>{t('guestList.bulkConfirmTitle') || 'Konfirmasi Upload'}</h3>
            <p style={{ marginBottom: '10px', color: 'var(--color-text-muted)' }}>
              {t('guestList.bulkConfirmDesc') || `${bulkPreview.length} tamu akan ditambahkan dari file "${bulkFileName}".`}
            </p>
            <div className="bulk-preview-table">
              <table className="guest-table">
                <thead>
                  <tr>
                    <th>{t('guestList.name') || 'Nama'}</th>
                    <th>{t('guestList.category') || 'Kategori'}</th>
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
                  ...{t('guestList.bulkAndMore') || `dan ${bulkPreview.length - 10} tamu lainnya`}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => { setShowBulkConfirm(false); setBulkPreview([]); }}>
                {t('activities.cancel') || 'Batal'}
              </button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={handleBulkConfirmUpload}>
                {t('guestList.bulkConfirmBtn') || `Upload ${bulkPreview.length} Tamu`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
