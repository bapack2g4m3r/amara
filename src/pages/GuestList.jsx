import { useState } from 'react';
import { Plus, Search, Users, Star, Clock, CheckCircle2, X, Trash2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/GuestList.css';

const GuestList = () => {
  const { guests, addGuest, updateGuestStatus, deleteGuest } = useWeddingStore();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Guests');
  
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    category: 'Family',
    pax: 1,
    status: 'Pending'
  });

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.name) return;
    
    await addGuest({
      name: guestForm.name,
      email: guestForm.email,
      category: guestForm.category,
      pax: Number(guestForm.pax),
      status: guestForm.status
    });
    
    setShowModal(false);
    setGuestForm({ name: '', email: '', category: 'Family', pax: 1, status: 'Pending' });
  };

  // Stats calculation
  const totalGuests = guests.reduce((acc, g) => acc + (g.status !== 'Declined' ? g.pax : 0), 0);
  const vipCount = guests.filter(g => g.category.includes('VIP') && g.status !== 'Declined').reduce((acc, g) => acc + g.pax, 0);
  const pendingCount = guests.filter(g => g.status === 'Pending').reduce((acc, g) => acc + g.pax, 0);
  const confirmedCount = guests.filter(g => g.status === 'Confirmed').reduce((acc, g) => acc + g.pax, 0);

  // Filtering
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchFilter = true;
    if (activeFilter === 'VIP') matchFilter = g.category.includes('VIP');
    else if (activeFilter === 'Family') matchFilter = g.category.includes('Family');
    else if (activeFilter === 'Friends') matchFilter = g.category.includes('Friends');
    
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
            <span className="stat-label">{t('guestList.totalPax')}</span>
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
          <div className="stat-icon bg-orange"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.pending')}</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-green"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">{t('guestList.confirmed')}</span>
            <span className="stat-value">{confirmedCount}</span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('guestList.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {['All Guests', 'VIP', 'Family', 'Friends'].map(filter => (
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
              <th>{t('vendor.category').toUpperCase()}</th>
              <th>{t('vendor.status').toUpperCase()}</th>
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
                <td><span className={`badge-category ${guest.category.includes('VIP') ? 'vip' : ''}`}>{guest.category}</span></td>
                <td>
                  <select 
                    value={guest.status} 
                    onChange={(e) => updateGuestStatus(guest.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: guest.status === 'Confirmed' ? '#D1FAE5' : guest.status === 'Declined' ? '#FEE2E2' : '#FEF3C7', color: guest.status === 'Confirmed' ? '#047857' : guest.status === 'Declined' ? '#B91C1C' : '#B45309' }}
                  >
                    <option value="Pending">{t('guestList.pending')}</option>
                    <option value="Confirmed">{t('guestList.confirmed')}</option>
                    <option value="Declined">{t('guestList.declined')}</option>
                  </select>
                </td>
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
      </div>

      {/* Add Guest Modal */}
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
                    <option>Corporate</option>
                    <option>VIP Family</option>
                    <option>VIP Friends</option>
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
