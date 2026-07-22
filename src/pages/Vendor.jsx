import { useState } from 'react';
import { Search, Heart, Star, Plus, X, Trash2, Edit2, Globe, Link, ExternalLink, CheckCircle } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Vendor.css';

const MOCK_CATEGORIES = [
  'Persiapan Awal', 'Lamaran', 'Seserahan, Mahar, dan Cincin', 'Wedding Organizer', 
  'Venue', 'Administrasi', 'Catering', 'Dekorasi', 'Attire', 'MUA', 'Dokumentasi', 
  'MC & Entertainment', 'Undangan', 'Others'
];

const IconInstagram = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const IconTikTok = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const Vendor = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, customCategories, addCustomCategory } = useWeddingStore();
  const { t, language } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alpha_asc'); // price_asc, price_desc, rating_desc, alpha_asc
  const [editingVendorId, setEditingVendorId] = useState(null);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const allCategories = [...MOCK_CATEGORIES, ...customCategories];

  const displayCategory = (cat) => {
    const trans = t(`cat.${cat}`);
    return trans.startsWith('cat.') ? cat : trans;
  };

  const defaultForm = {
    name: '',
    category: 'Photographer', // fallback
    description: '',
    note: '',
    website_url: '',
    social_media_url: '',
    price: '',
    rating: 5
  };
  
  const [vendorForm, setVendorForm] = useState(defaultForm);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCustomCategory(newCategoryName.trim());
    setVendorForm({ ...vendorForm, category: newCategoryName.trim() });
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name) return;
    
    const payload = {
      name: vendorForm.name,
      category: vendorForm.category,
      description: vendorForm.description, // Detail Package
      note: vendorForm.note,
      website_url: vendorForm.website_url,
      social_media_url: vendorForm.social_media_url,
      price: Number(vendorForm.price),
      rating: Number(vendorForm.rating)
    };

    if (editingVendorId) {
      await updateVendor(editingVendorId, payload);
    } else {
      await addVendor({ ...payload, is_favorite: false, is_chosen: false });
    }
    
    setShowModal(false);
    setEditingVendorId(null);
    setVendorForm(defaultForm);
  };

  const handleEdit = (vendor) => {
    setEditingVendorId(vendor.id);
    setVendorForm({
      name: vendor.name,
      category: vendor.category,
      description: vendor.description || '',
      note: vendor.note || '',
      website_url: vendor.website_url || '',
      social_media_url: vendor.social_media_url || '',
      price: vendor.price,
      rating: vendor.rating
    });
    setShowModal(true);
  };

  const toggleChosen = async (vendor) => {
    await updateVendor(vendor.id, { is_chosen: !vendor.is_chosen });
  };

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchFilter = false;
    if (activeFilter === 'All Vendors') matchFilter = true;
    else if (activeFilter === 'Chosen Vendors') matchFilter = v.is_chosen;
    else matchFilter = v.category === activeFilter;
    
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'alpha_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="vendor-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>{t('vendor.title')}</h1>
          <p className="subtitle">{t('vendor.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingVendorId(null);
          setVendorForm({ ...defaultForm, category: allCategories[0] || 'Photographer' });
          setShowModal(true);
        }}>
          <Plus size={16} /> {t('vendor.addVendor')}
        </button>
      </header>

      <div className="search-bar-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('vendor.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '30px', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', cursor: 'pointer' }}
        >
          <option value="alpha_asc">{language === 'id' ? 'Abjad (A-Z)' : 'Alphabetical (A-Z)'}</option>
          <option value="price_asc">{language === 'id' ? 'Harga (Terendah)' : 'Price (Lowest)'}</option>
          <option value="price_desc">{language === 'id' ? 'Harga (Tertinggi)' : 'Price (Highest)'}</option>
          <option value="rating_desc">{language === 'id' ? 'Rating (Tertinggi)' : 'Rating (Highest)'}</option>
        </select>
      </div>

      <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['All Vendors', 'Chosen Vendors', ...allCategories].map(filter => (
          <span 
            key={filter} 
            className={`pill ${activeFilter === filter ? 'active' : ''} ${filter === 'Chosen Vendors' && activeFilter === filter ? 'pill-chosen' : ''}`}
            onClick={() => setActiveFilter(filter)}
            style={filter === 'Chosen Vendors' ? { border: '1px solid var(--color-primary)', fontWeight: activeFilter === filter ? 600 : 500, color: activeFilter === filter ? 'white' : 'var(--color-primary)' } : {}}
          >
            {filter === 'All Vendors' ? t('vendor.allVendors') : filter === 'Chosen Vendors' ? t('vendor.chosenVendors') : displayCategory(filter)}
          </span>
        ))}
      </div>

      <div className="vendor-list">
        {filteredVendors.map(vendor => (
          <div className={`card vendor-card ${vendor.is_chosen ? 'chosen-card' : ''}`} key={vendor.id} style={{ position: 'relative' }}>
            <div className="vendor-info">
              <div className="vendor-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0 }}>{vendor.name}</h3>
                  {vendor.is_chosen && (
                    <div style={{ background: 'var(--color-success)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> {language === 'id' ? 'Terpilih' : 'Chosen'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="rating"><Star size={14} fill="currentColor" /> {vendor.rating}</span>
                  <button 
                    onClick={() => updateVendor(vendor.id, { is_favorite: !vendor.is_favorite })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: vendor.is_favorite ? 'var(--color-danger)' : 'var(--color-text-muted)', display: 'flex', padding: 0 }}
                  >
                    <Heart size={18} fill={vendor.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: '10px' }}>{displayCategory(vendor.category)}</span>
                {vendor.social_media_url && (
                  <a href={vendor.social_media_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                    {vendor.social_media_url.toLowerCase().includes('instagram') ? (
                      <IconInstagram size={14} />
                    ) : vendor.social_media_url.toLowerCase().includes('tiktok') ? (
                      <IconTikTok size={14} />
                    ) : (
                      <Link size={14} />
                    )}
                  </a>
                )}
                {vendor.website_url && (
                  <a href={vendor.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                    <Globe size={14} />
                  </a>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>{t('vendor.detailPackage')}:</strong>
                <p className="vendor-desc" style={{ marginTop: '2px', whiteSpace: 'pre-wrap' }}>{vendor.description}</p>
              </div>

              {vendor.note && (
                <div style={{ marginBottom: '15px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid var(--color-warning)', padding: '8px 12px', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--color-warning-dark, #b45309)', display: 'block', marginBottom: '2px' }}>{t('vendor.note')}:</strong>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--color-text)' }}>{vendor.note}</p>
                </div>
              )}

              <div className="vendor-price-row">
                <span className="price">{formatCurrency(vendor.price)}</span>
              </div>
              <div className="vendor-actions" style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn-primary btn-full ${vendor.is_chosen ? 'btn-success' : ''}`} 
                  onClick={() => toggleChosen(vendor)}
                  style={vendor.is_chosen ? { backgroundColor: 'var(--color-success)' } : {}}
                >
                  {vendor.is_chosen ? t('vendor.chosen') : t('vendor.chooseThis')}
                </button>
              </div>
              
              {/* Edit and Delete Buttons at bottom */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  onClick={() => handleEdit(vendor)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                  <Edit2 size={14} /> {t('vendor.edit')}
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(t('vendor.deleteConfirm'))) {
                      deleteVendor(vendor.id);
                    }
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} /> {t('vendor.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>{t('vendor.noVendors')}</p>
        )}
      </div>

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{editingVendorId ? t('vendor.editVendor') : t('vendor.addVendor')}</h3>
            <form onSubmit={handleSaveVendor} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.vendorName')}</label>
                <input type="text" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.category')}</label>
                {isAddingCategory ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      placeholder={t('vendor.newCategory')}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                      autoFocus
                    />
                    <button type="button" onClick={handleAddCategory} className="btn-primary" style={{ padding: '0 15px', borderRadius: '8px' }}>{t('vendor.add')}</button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="btn-secondary" style={{ padding: '0 15px', borderRadius: '8px' }}>X</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={vendorForm.category} 
                      onChange={e => setVendorForm({...vendorForm, category: e.target.value})} 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{displayCategory(cat)}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setIsAddingCategory(true)} className="btn-secondary" style={{ padding: '0 15px', borderRadius: '8px' }}>{t('vendor.addNew')}</button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.detailPackage')}</label>
                <textarea 
                  value={vendorForm.description} 
                  onChange={e => setVendorForm({...vendorForm, description: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder={t('vendor.placeholderDesc')}
                ></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.note')}</label>
                <textarea 
                  value={vendorForm.note} 
                  onChange={e => setVendorForm({...vendorForm, note: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '60px', fontFamily: 'inherit' }}
                  placeholder={t('vendor.placeholderNote')}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.websiteUrl')}</label>
                  <input type="url" value={vendorForm.website_url} onChange={e => setVendorForm({...vendorForm, website_url: e.target.value})} placeholder="https://" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.socialMediaUrl')}</label>
                  <input type="url" value={vendorForm.social_media_url} onChange={e => setVendorForm({...vendorForm, social_media_url: e.target.value})} placeholder="https://instagram.com/..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.price')} (Rp)</label>
                  <input type="number" value={vendorForm.price} onChange={e => setVendorForm({...vendorForm, price: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 500 }}>{t('vendor.rating')} (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={vendorForm.rating} onChange={e => setVendorForm({...vendorForm, rating: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>{t('budget.save')}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px' }}>{t('vendor.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
