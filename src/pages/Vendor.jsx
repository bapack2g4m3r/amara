import { useState, useMemo } from 'react';
import { Search, Heart, Star, Plus, X, Trash2, Edit2, Globe, Link, ExternalLink, CheckCircle, MoreHorizontal } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Vendor.css';

const IconInstagram = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const IconTikTok = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const Vendor = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, customCategories, addCustomCategory } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Vendors');
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alpha_asc');
  const [editingVendorId, setEditingVendorId] = useState(null);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Extract unique categories from vendors and merge with customCategories
  const dynamicCategories = useMemo(() => {
    const cats = new Set([...customCategories]);
    vendors.forEach(v => {
      if (v.category) cats.add(v.category);
    });
    // Convert to array and filter out empty
    return Array.from(cats).filter(Boolean).sort();
  }, [vendors, customCategories]);

  // Determine categories to show when minimized (max 3)
  const topCategories = dynamicCategories.slice(0, 3);
  const remainingCategories = dynamicCategories.slice(3);

  const displayCategory = (cat) => {
    const trans = t(`cat.${cat}`);
    return trans.startsWith('cat.') ? cat : trans;
  };

  const defaultForm = {
    name: '',
    category: dynamicCategories[0] || 'Venue',
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
    
    // Auto-detect Instagram format if it starts with @
    let processedSocialMedia = vendorForm.social_media_url.trim();

    const payload = {
      name: vendorForm.name,
      category: vendorForm.category,
      description: vendorForm.description,
      note: vendorForm.note,
      website_url: vendorForm.website_url.trim(),
      social_media_url: processedSocialMedia,
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

  // Parsing Social Media Links
  const getSocialLink = (val) => {
    if (!val) return null;
    if (val.startsWith('@')) return `https://instagram.com/${val.substring(1)}`;
    if (!val.startsWith('http')) return `https://${val}`;
    return val;
  };

  // Generate Thumbnail URL
  const getAvatarUrl = (vendor) => {
    const social = vendor.social_media_url;
    if (social && social.startsWith('@')) {
       const username = social.substring(1);
       return `https://unavatar.io/instagram/${username}?fallback=false`;
    } else if (social && social.toLowerCase().includes('instagram.com/')) {
       try {
         const url = new URL(social.startsWith('http') ? social : `https://${social}`);
         const path = url.pathname.split('/').filter(Boolean)[0];
         if (path) return `https://unavatar.io/instagram/${path}?fallback=false`;
       } catch(e) {}
    }
    
    // Default fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.name)}&background=random&color=fff&size=150`;
  };

  const handleImageError = (e, vendorName) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendorName)}&background=random&color=fff&size=150`;
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
          setVendorForm({ ...defaultForm, category: dynamicCategories[0] || 'Venue' });
          setShowModal(true);
        }}>
          <Plus size={16} /> {t('vendor.addVendor')}
        </button>
      </header>

      <div className="search-bar-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '250px' }}>
          <Search size={20} className="search-icon" />
          <input type="text" placeholder={t('vendor.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="alpha_asc">{language === 'id' ? 'Abjad (A-Z)' : 'Alphabetical (A-Z)'}</option>
          <option value="price_asc">{language === 'id' ? 'Harga (Terendah)' : 'Price (Lowest)'}</option>
          <option value="price_desc">{language === 'id' ? 'Harga (Tertinggi)' : 'Price (Highest)'}</option>
          <option value="rating_desc">{language === 'id' ? 'Rating (Tertinggi)' : 'Rating (Highest)'}</option>
        </select>
      </div>

      <div className="filter-pills">
        <span 
          className={`pill ${activeFilter === 'All Vendors' ? 'active' : ''}`}
          onClick={() => setActiveFilter('All Vendors')}
        >
          {t('vendor.allVendors')}
        </span>
        <span 
          className={`pill ${activeFilter === 'Chosen Vendors' ? 'active pill-chosen' : ''}`}
          onClick={() => setActiveFilter('Chosen Vendors')}
          style={{ border: '1px solid var(--color-primary)', fontWeight: activeFilter === 'Chosen Vendors' ? 600 : 500, color: activeFilter === 'Chosen Vendors' ? 'white' : 'var(--color-primary)' }}
        >
          {t('vendor.chosenVendors')}
        </span>
        
        {/* Dynamic Filters */}
        {topCategories.map(filter => (
          <span 
            key={filter} 
            className={`pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {displayCategory(filter)}
          </span>
        ))}

        {!showAllFilters && remainingCategories.length > 0 && (
          <span className="pill pill-more" onClick={() => setShowAllFilters(true)}>
            <MoreHorizontal size={16} />
          </span>
        )}

        {showAllFilters && remainingCategories.map(filter => (
          <span 
            key={filter} 
            className={`pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {displayCategory(filter)}
          </span>
        ))}
      </div>

      <div className="vendor-list grid-layout">
        {filteredVendors.map(vendor => (
          <div className={`card vendor-card ${vendor.is_chosen ? 'chosen-card' : ''}`} key={vendor.id}>
            
            <div className="vendor-header-banner">
              <div className="vendor-avatar-wrapper">
                <img 
                  src={getAvatarUrl(vendor)} 
                  alt={vendor.name} 
                  className="vendor-avatar"
                  onError={(e) => handleImageError(e, vendor.name)}
                />
              </div>
              <button 
                className="btn-heart"
                onClick={() => updateVendor(vendor.id, { is_favorite: !vendor.is_favorite })}
                style={{ color: vendor.is_favorite ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
              >
                <Heart size={20} fill={vendor.is_favorite ? 'currentColor' : 'none'} />
              </button>
              {vendor.is_chosen && (
                 <div className="badge-chosen">
                    <CheckCircle size={14} /> {language === 'id' ? 'Terpilih' : 'Chosen'}
                 </div>
              )}
            </div>

            <div className="vendor-info">
              <div className="vendor-title-row">
                <h3>{vendor.name}</h3>
              </div>
              
              <div className="vendor-meta-row">
                <span className="category-tag">{displayCategory(vendor.category)}</span>
                <span className="rating"><Star size={16} fill="currentColor" /> {vendor.rating}</span>
                
                <div className="vendor-links">
                  {vendor.social_media_url && (
                    <a href={getSocialLink(vendor.social_media_url)} target="_blank" rel="noopener noreferrer" className="social-link">
                      {(vendor.social_media_url.toLowerCase().includes('instagram') || vendor.social_media_url.startsWith('@')) ? (
                        <IconInstagram size={18} />
                      ) : vendor.social_media_url.toLowerCase().includes('tiktok') ? (
                        <IconTikTok size={18} />
                      ) : (
                        <Link size={18} />
                      )}
                    </a>
                  )}
                  {vendor.website_url && (
                    <a href={vendor.website_url.startsWith('http') ? vendor.website_url : `https://${vendor.website_url}`} target="_blank" rel="noopener noreferrer" className="website-link">
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              </div>

              <div className="vendor-desc-container">
                <strong>{t('vendor.detailPackage')}:</strong>
                <p className="vendor-desc">{vendor.description}</p>
              </div>

              {vendor.note && (
                <div className="vendor-note-container">
                  <strong>{t('vendor.note')}:</strong>
                  <p>{vendor.note}</p>
                </div>
              )}

              <div className="vendor-price-row">
                <span className="price">{formatCurrency(vendor.price)}</span>
              </div>
              
              <div className="vendor-actions">
                <button 
                  className={`btn-primary btn-full ${vendor.is_chosen ? 'btn-success' : ''}`} 
                  onClick={() => toggleChosen(vendor)}
                >
                  {vendor.is_chosen ? t('vendor.chosen') : t('vendor.chooseThis')}
                </button>
              </div>
              
              <div className="vendor-footer-actions">
                <button onClick={() => handleEdit(vendor)} className="action-btn">
                  <Edit2 size={16} /> {t('vendor.edit')}
                </button>
                <button onClick={() => {
                    if (window.confirm(t('vendor.deleteConfirm'))) deleteVendor(vendor.id);
                  }} 
                  className="action-btn danger"
                >
                  <Trash2 size={16} /> {t('vendor.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <div className="no-vendors-message">
            <p>{t('vendor.noVendors')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-card vendor-modal">
            <button onClick={() => setShowModal(false)} className="modal-close"><X size={24}/></button>
            <h3>{editingVendorId ? t('vendor.editVendor') : t('vendor.addVendor')}</h3>
            <form onSubmit={handleSaveVendor} className="vendor-form">
              <div className="form-group">
                <label>{t('vendor.vendorName')}</label>
                <input type="text" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} required className="form-input" />
              </div>
              
              <div className="form-group">
                <label>{t('vendor.category')}</label>
                {isAddingCategory ? (
                  <div className="flex-row">
                    <input 
                      type="text" 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      placeholder={t('vendor.newCategory')}
                      className="form-input"
                      autoFocus
                    />
                    <button type="button" onClick={handleAddCategory} className="btn-primary form-btn">{t('vendor.add')}</button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="btn-secondary form-btn">X</button>
                  </div>
                ) : (
                  <div className="flex-row">
                    <select 
                      value={vendorForm.category} 
                      onChange={e => setVendorForm({...vendorForm, category: e.target.value})} 
                      className="form-select"
                    >
                      {dynamicCategories.length === 0 && <option value="Venue">Venue</option>}
                      {dynamicCategories.map(cat => (
                        <option key={cat} value={cat}>{displayCategory(cat)}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setIsAddingCategory(true)} className="btn-secondary form-btn">{t('vendor.addNew')}</button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t('vendor.detailPackage')}</label>
                <textarea 
                  value={vendorForm.description} 
                  onChange={e => setVendorForm({...vendorForm, description: e.target.value})} 
                  className="form-textarea"
                  placeholder={t('vendor.placeholderDesc')}
                ></textarea>
              </div>

              <div className="form-group">
                <label>{t('vendor.note')}</label>
                <textarea 
                  value={vendorForm.note} 
                  onChange={e => setVendorForm({...vendorForm, note: e.target.value})} 
                  className="form-textarea note-textarea"
                  placeholder={t('vendor.placeholderNote')}
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('vendor.websiteUrl')}</label>
                  <input type="text" value={vendorForm.website_url} onChange={e => setVendorForm({...vendorForm, website_url: e.target.value})} placeholder="bridestory.com/..." className="form-input" />
                </div>
                <div className="form-group">
                  <label>{t('vendor.socialMediaUrl')} (IG/TikTok)</label>
                  <input type="text" value={vendorForm.social_media_url} onChange={e => setVendorForm({...vendorForm, social_media_url: e.target.value})} placeholder="@username atau https://..." className="form-input" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>{t('vendor.price')} (Rp)</label>
                  <input type="number" value={vendorForm.price} onChange={e => setVendorForm({...vendorForm, price: e.target.value})} required className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('vendor.rating')} (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={vendorForm.rating} onChange={e => setVendorForm({...vendorForm, rating: e.target.value})} required className="form-input" />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary btn-submit">{t('budget.save')}</button>
                <button type="button" className="btn-secondary btn-cancel" onClick={() => setShowModal(false)}>{t('vendor.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
