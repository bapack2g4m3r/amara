import { useState } from 'react';
import { Plus, Search, Users, Star, Clock, CheckCircle2, X, Trash2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/GuestList.css';

const GuestList = () => {
  const { guests, addGuest, deleteGuest, profile } = useWeddingStore();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Guests');
  
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    category: 'Family',
    pax: 1,
    guest_type: ''
  });

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const lines = content.split('\n').filter(l => l.trim() !== '');
      for (const line of lines) {
        const [name, email, category, paxStr, guest_type] = line.split(',');
        const pax = Number(paxStr) || 1;
        await addGuest({ name, email, category: (category || '').trim(), pax, guest_type: (guest_type || '').trim() });
      }
      alert('Bulk upload selesai');
    };
    reader.readAsText(file);
  };

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

  // Stats calculation
  const cpwCount = guests.filter(g => g.guest_type === 'CPW').reduce((acc, g) => acc + g.pax, 0);
  const cppCount = guests.filter(g => g.guest_type === 'CPP').reduce((acc, g) => acc + g.pax, 0);
  const totalCpwp = cpwCount + cppCount;
  const vipCount = guests.filter(g => g.category.includes('VIP')).reduce((acc, g) => acc + g.pax, 0);
  const totalGuests = guests.reduce((acc, g) => acc + g.pax, 0);

  // Filtering
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchFilter = true;
    if (activeFilter === 'VIP') {
      matchFilter = g.category.includes('VIP');
    } else if (activeFilter === 'Reguler') {
      matchFilter = g.category === 'Family' || g.category === 'Friends';
    }
    return matchSearch && matchFilter;
  });

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCategoryColor = (category) => {
    if (category.includes('VIP')) return 'bg-yellow';
    if (category.includes('Family')) return 'bg-blue';
    if (category.includes('Corporate')) return 'bg-green';
    return ''; // default purple
  };

  return (
    <div className="guest-list-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>{t('guestList.title')}</h1>
          <p className="subtitle">{t('guestList.subtitle')}</p>
        </div>
        <button className="btn-primary btn-add-guest" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('guestList.addGuest')}
        </button>
      </header>

      <div className="guest-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-purple"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.regularPax')}</span>
            <span className="stat-value">{totalGuests}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-red"><Star size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.vipPax')}</span>
            <span className="stat-value">{vipCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-pink"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">CPW</span>
            <span className="stat-value">{cpwCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-indigo"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">CPP</span>
            <span className="stat-value">{cppCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-teal"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total CPW/CPP</span>
            <span className="stat-value">{totalCpwp}</span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('guestList.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {['All Guests', 'VIP', 'Reguler'].map(filter => (
            <span 
              key={filter} 
              className={`pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

      <div className="guest-table-container">
        <table className="guest-table">
          <thead>
            <tr>
              <th>{t('guestList.name')}</th>
              <th>{t('guestList.category').toUpperCase()}</th>
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
                <td>{guest.category}</td>
                <td className="text-right">{guest.pax}</td>
                <td className="text-right">
                  <button onClick={() => deleteGuest(guest.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
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
        <div style={{ marginTop: '20px' }}>
          <input type="file" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleBulkUpload} />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '15px', top: '15px' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('guestList.addGuest')}</h3>
            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('guestList.guestName')}</label>
                <input type="text" value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('guestList.emailOpt')}</label>
                <input type="email" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('vendor.category')}</label>
                  <select value={guestForm.category} onChange={e => setGuestForm({...guestForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }}>
                    <option>Family</option>
                    <option>Friends</option>
                    <option>VIP</option>
                  </select>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginTop: '10px' }}>{t('guestList.guestType')}</label>
                  <select value={guestForm.guest_type || ''} onChange={e => setGuestForm({...guestForm, guest_type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }}>
                    <option value="">{t('guestList.selectType')}</option>
                    <option>CPW</option>
                    <option>CPP</option>
                    <option>Teman CPW</option>
                    <option>Teman CPP</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('guestList.totalPax')}</label>
                  <input type="number" min="1" value={guestForm.pax} onChange={e => setGuestForm({...guestForm, pax: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GuestList;
