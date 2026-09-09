import { useState, useMemo, useEffect } from 'react';
import { Search, Heart, Star, Plus, X, Trash2, Edit2, Globe, Link, ExternalLink, CheckCircle, User, MessageCircle, Phone } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Vendor.css';

const BASE_CATEGORIES = [
  'Venue', 'Catering', 'Dekorasi', 'Attire', 'Makeup', 
  'Dokumentasi', 'Entertainment', 'Undangan', 'Souvenir', 
  'Cincin', 'Mahar', 'Seserahan', 'Wedding Organizer'
];

const CATEGORY_TRANSLATIONS = {
  'Venue': 'Venue',
  'Catering': 'Catering',
  'Dekorasi': 'Decoration',
  'Attire': 'Attire',
  'Makeup': 'Makeup',
  'Dokumentasi': 'Documentation',
  'Entertainment': 'Entertainment',
  'Undangan': 'Invitation',
  'Souvenir': 'Souvenir',
  'Cincin': 'Rings',
  'Mahar': 'Dowry',
  'Seserahan': 'Gifts (Seserahan)',
  'Wedding Organizer': 'Wedding Organizer'
};

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
  const { 
    vendors, 
    addVendor, 
    updateVendor, 
    deleteVendor, 
    customCategories, 
    addCustomCategory,
    updateCustomCategories,
    userRole
  } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const { t, language } = useTranslation();
  
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('favorite_first');
  const [editingVendorId, setEditingVendorId] = useState(null);
  
  // Custom Category State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Combined categories for the modal dropdown (base + custom + existing on vendors)
  const allCategories = useMemo(() => {
    const list = [...BASE_CATEGORIES];
    (customCategories || []).forEach(cat => {
      if (!list.includes(cat)) list.push(cat);
    });
    vendors.forEach(v => {
      if (v.category && !list.includes(v.category)) list.push(v.category);
    });
    return list;
  }, [customCategories, vendors]);

  // Extract unique categories ONLY from existing vendors for filter pills
  const dynamicCategories = useMemo(() => {
    const cats = new Set();
    vendors.forEach(v => {
      if (v.category) cats.add(v.category);
    });
    // Convert to array and filter out empty
    return Array.from(cats).filter(Boolean).sort();
  }, [vendors]);

  // If the active filter category no longer exists among vendors, reset to 'All Vendors'
  useEffect(() => {
    if (
      activeFilter !== 'All Vendors' &&
      activeFilter !== 'Chosen Vendors' &&
      activeFilter !== 'Favorite Vendors' &&
      !dynamicCategories.includes(activeFilter)
    ) {
      setActiveFilter('All Vendors');
    }
  }, [dynamicCategories, activeFilter]);

  const displayCategory = (cat) => {
    if (language === 'id') return cat;
    return CATEGORY_TRANSLATIONS[cat] || cat;
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    addCustomCategory(trimmed);
    setVendorForm(prev => ({ ...prev, category: trimmed }));
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const handleDeleteCustomCategory = async (catToDelete) => {
    const updated = (customCategories || []).filter(c => c !== catToDelete);
    updateCustomCategories(updated);
    
    if (vendorForm.category === catToDelete) {
      setVendorForm(prev => ({ ...prev, category: BASE_CATEGORIES[0] || 'Venue' }));
    }

    const fallbackCat = BASE_CATEGORIES[0] || 'Venue';
    const affected = vendors.filter(v => v.category === catToDelete);
    for (const v of affected) {
      await updateVendor(v.id, { category: fallbackCat });
    }
  };

  const unusedCustomCategories = useMemo(() => {
    return (customCategories || []).filter(cat => !vendors.some(v => v.category === cat));
  }, [customCategories, vendors]);

  const handleCleanUnusedCategories = () => {
    const activeCustom = (customCategories || []).filter(cat => vendors.some(v => v.category === cat));
    updateCustomCategories(activeCustom);
  };

  const defaultForm = {
    name: '',
    category: BASE_CATEGORIES[0] || 'Venue',
    description: '',
    note: '',
    website_url: '',
    social_media_url: '',
    contact_name: '',
    contact_phone: '',
    price: '',
    rating: 5
  };
  
  const [vendorForm, setVendorForm] = useState(defaultForm);



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
      contact_name: vendorForm.contact_name?.trim() || null,
      contact_phone: vendorForm.contact_phone?.trim() || null,
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
      contact_name: vendor.contact_name || '',
      contact_phone: vendor.contact_phone || '',
      price: vendor.price,
      rating: vendor.rating
    });
    setShowModal(true);
  };

  const toggleChosen = async (vendor) => {
    await updateVendor(vendor.id, { is_chosen: !vendor.is_chosen });
  };

  const favoritesCount = useMemo(() => {
    return vendors.filter(v => v.is_favorite).length;
  }, [vendors]);

  const chosenCount = useMemo(() => {
    return vendors.filter(v => v.is_chosen).length;
  }, [vendors]);

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchFilter = false;
    if (activeFilter === 'All Vendors') matchFilter = true;
    else if (activeFilter === 'Chosen Vendors') matchFilter = v.is_chosen;
    else if (activeFilter === 'Favorite Vendors') matchFilter = v.is_favorite;
    else matchFilter = v.category === activeFilter;
    
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === 'favorite_first') {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'alpha_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  // Helper to parse social media input into platform, full URL, and username
  const parseSocialInput = (val) => {
    if (!val) return { platform: 'none', url: null, username: '' };
    const cleaned = val.trim();
    const lowercase = cleaned.toLowerCase();

    // 1. TikTok patterns
    if (lowercase.includes('tiktok.com')) {
      let username = '';
      try {
        const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1] || '';
        username = lastPart.startsWith('@') ? lastPart.substring(1) : lastPart;
      } catch (e) {
        const parts = cleaned.split('/');
        const last = parts[parts.length - 1] || '';
        username = last.startsWith('@') ? last.substring(1) : last;
      }
      return {
        platform: 'tiktok',
        url: cleaned.startsWith('http') ? cleaned : `https://${cleaned}`,
        username
      };
    }

    // 2. Instagram URL patterns
    const isInstagramUrl = lowercase.includes('instagram.com') || 
                           lowercase.includes('instagr.am') || 
                           lowercase.includes('ig.me') || 
                           lowercase.includes('ig.com');

    if (isInstagramUrl) {
      let username = '';
      try {
        const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const path = pathParts[0] || '';
        if (path && !['p', 'reel', 'stories', 'explore'].includes(path)) {
          username = path;
        }
      } catch (e) {
        const parts = cleaned.split('/');
        username = parts[parts.length - 1] || '';
      }
      return {
        platform: 'instagram',
        url: cleaned.startsWith('http') ? cleaned : `https://${cleaned}`,
        username
      };
    }

    // 3. Instagram username starting with @
    if (cleaned.startsWith('@')) {
      const username = cleaned.substring(1);
      return {
        platform: 'instagram',
        url: `https://instagram.com/${username}`,
        username
      };
    }

    // 4. Plain username (assumed Instagram unless it is a domain name)
    const isDomain = /\.(com|net|id|co|org|me|info|biz|site|xyz|online|web|tech|us|uk)\b/i.test(lowercase);
    const hasSlash = cleaned.includes('/');

    if (!isDomain && !hasSlash && cleaned.length > 0) {
      return {
        platform: 'instagram',
        url: `https://instagram.com/${cleaned}`,
        username: cleaned
      };
    }

    // 5. Fallback general link
    return {
      platform: 'link',
      url: cleaned.startsWith('http') ? cleaned : `https://${cleaned}`,
      username: ''
    };
  };

  // Parsing Social Media Links
  const getSocialLink = (val) => {
    return parseSocialInput(val).url;
  };

  // Generate Thumbnail URL
  const getAvatarUrl = (vendor) => {
    const social = vendor.social_media_url;
    if (social) {
      const { platform, username } = parseSocialInput(social);
      if (platform === 'instagram' && username) {
        return `https://unavatar.io/instagram/${username}?fallback=false`;
      }
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
      <header className="page-header">
        <div>
          <h1>{t('vendor.title')}</h1>
          <p className="subtitle">{t('vendor.subtitle')}</p>
        </div>
        {!isReadOnly && (
          <button className="btn-primary" onClick={() => {
            setEditingVendorId(null);
            setVendorForm({ ...defaultForm, category: BASE_CATEGORIES[0] || 'Venue' });
            setShowModal(true);
          }}>
            <Plus size={16} /> {t('vendor.addVendor')}
          </button>
        )}
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder={t('vendor.search')} className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="favorite_first">{language === 'id' ? '❤️ Favorit Terlebih Dahulu' : '❤️ Favorites First'}</option>
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
          {t('vendor.chosenVendors')} {chosenCount > 0 && `(${chosenCount})`}
        </span>
        <span 
          className={`pill ${activeFilter === 'Favorite Vendors' ? 'active pill-favorite' : ''}`}
          onClick={() => setActiveFilter('Favorite Vendors')}
          style={{ 
            border: '1px solid var(--color-danger)', 
            fontWeight: activeFilter === 'Favorite Vendors' ? 600 : 500, 
            color: activeFilter === 'Favorite Vendors' ? 'white' : 'var(--color-danger)' 
          }}
        >
          {t('vendor.favoriteVendors')} {favoritesCount > 0 && `(${favoritesCount})`}
        </span>
        
        {/* Dynamic Category Filters */}
        {dynamicCategories.map(filter => {
          const count = vendors.filter(v => v.category === filter).length;
          return (
            <span 
              key={filter} 
              className={`pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {displayCategory(filter)} {count > 0 && `(${count})`}
            </span>
          );
        })}
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
                className={`btn-heart ${vendor.is_favorite ? 'is-fav' : ''}`}
                onClick={() => !isReadOnly && updateVendor(vendor.id, { is_favorite: !vendor.is_favorite })}
                disabled={isReadOnly}
                title={vendor.is_favorite 
                  ? (language === 'id' ? 'Hapus dari Favorit' : 'Remove from Favorites') 
                  : (language === 'id' ? 'Simpan ke Favorit' : 'Save to Favorites')}
                style={{ color: vendor.is_favorite ? 'var(--color-danger)' : 'var(--color-text-muted)', cursor: isReadOnly ? 'default' : 'pointer' }}
              >
                <Heart size={20} fill={vendor.is_favorite ? 'currentColor' : 'none'} />
              </button>
              {vendor.is_chosen && (
                 <div className="badge-chosen">
                    <CheckCircle size={14} /> {language === 'id' ? '🌟 Vendor Terpilih' : '🌟 Chosen Vendor'}
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
                  {vendor.social_media_url && (() => {
                    const { platform, url } = parseSocialInput(vendor.social_media_url);
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                        {platform === 'instagram' ? (
                          <IconInstagram size={18} />
                        ) : platform === 'tiktok' ? (
                          <IconTikTok size={18} />
                        ) : (
                          <Link size={18} />
                        )}
                      </a>
                    );
                  })()}
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

              {(vendor.contact_name || vendor.contact_phone) && (
                <div className="vendor-contact-container">
                  <strong>{language === 'id' ? 'Kontak / PIC' : 'Contact / PIC'}:</strong>
                  <div className="vendor-contact-detail">
                    {vendor.contact_name && (
                      <span className="vendor-contact-name">
                        <User size={13} /> {vendor.contact_name}
                      </span>
                    )}
                    {vendor.contact_phone && (() => {
                      const cleanPhone = vendor.contact_phone.replace(/[^0-9]/g, '');
                      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                      return (
                        <a 
                          href={`https://wa.me/${waNumber}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="vendor-contact-phone-link"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle size={13} /> {vendor.contact_phone}
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="vendor-price-row">
                <span className="price" style={{ color: vendor.is_chosen ? '#059669' : 'var(--color-primary)' }}>
                  {formatCurrency(vendor.price)}
                </span>
                {vendor.is_chosen && (
                  <span style={{ 
                    fontSize: '0.74rem', 
                    fontWeight: 700, 
                    color: '#059669', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    padding: '3px 9px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    {language === 'id' ? '✓ Terpilih' : '✓ Chosen'}
                  </span>
                )}
              </div>
              
              {!isReadOnly && (
                <div className="vendor-actions">
                  {vendor.is_chosen ? (
                    <button 
                      className="btn-vendor-toggle btn-chosen btn-full" 
                      onClick={() => toggleChosen(vendor)}
                      title={language === 'id' ? 'Klik untuk membatalkan pilihan vendor ini' : 'Click to cancel vendor selection'}
                    >
                      <span className="state-default">
                        <CheckCircle size={16} />
                        <span>{language === 'id' ? 'Vendor Terpilih' : 'Chosen Vendor'}</span>
                      </span>
                      <span className="state-hover">
                        <X size={16} />
                        <span>{language === 'id' ? 'Batalkan Pilihan' : 'Cancel Selection'}</span>
                      </span>
                    </button>
                  ) : (
                    <button 
                      className="btn-vendor-toggle btn-choose btn-full" 
                      onClick={() => toggleChosen(vendor)}
                    >
                      <Plus size={16} />
                      <span>{language === 'id' ? 'Pilih Vendor Ini' : 'Choose This Vendor'}</span>
                    </button>
                  )}
                </div>
              )}
              
              {!isReadOnly && (
                <div className="vendor-footer-actions">
                  <button onClick={() => handleEdit(vendor)} className="action-btn">
                    <Edit2 size={16} /> {t('vendor.edit')}
                  </button>
                  <button 
                    onClick={() => setDeletingVendor(vendor)} 
                    className="action-btn danger"
                  >
                    <Trash2 size={16} /> {t('vendor.delete')}
                  </button>
                </div>
              )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>{t('vendor.category')}</label>
                  <button 
                    type="button" 
                    onClick={() => setShowCategoryModal(true)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--color-primary)', 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Plus size={13} />
                    {language === 'id' ? 'Kelola Kategori' : 'Manage Categories'}
                  </button>
                </div>
                <select 
                  className="form-select"
                  value={vendorForm.category || BASE_CATEGORIES[0] || 'Venue'}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowCategoryModal(true);
                    } else {
                      setVendorForm({ ...vendorForm, category: e.target.value });
                    }
                  }}
                  required
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {displayCategory(cat)}
                    </option>
                  ))}
                  <option disabled value="">──────────</option>
                  <option value="__add_new__" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {language === 'id' ? '+ Tambah Kategori Baru...' : '+ Add New Category...'}
                  </option>
                </select>
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
                  <label>{t('vendor.socialMediaUrl')}</label>
                  <input type="text" value={vendorForm.social_media_url} onChange={e => setVendorForm({...vendorForm, social_media_url: e.target.value})} placeholder={language === 'id' ? 'Link sosial media' : 'Social media link'} className="form-input" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{language === 'id' ? 'Nama Kontak / PIC (Opsional)' : 'Contact Name / PIC (Optional)'}</label>
                  <input 
                    type="text" 
                    value={vendorForm.contact_name} 
                    onChange={e => setVendorForm({...vendorForm, contact_name: e.target.value})} 
                    placeholder="cth: Mbak Sarah / Mas Budi" 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label>{language === 'id' ? 'No. Kontak / WhatsApp (Opsional)' : 'Contact / WhatsApp (Optional)'}</label>
                  <input 
                    type="tel" 
                    value={vendorForm.contact_phone} 
                    onChange={e => setVendorForm({...vendorForm, contact_phone: e.target.value})} 
                    placeholder="cth: 08123456789" 
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>{t('vendor.price')} (Rp)</label>
                  <input type="number" value={vendorForm.price} onChange={e => setVendorForm({...vendorForm, price: e.target.value})} required className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('vendor.rating')}</label>
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

      {/* Manage Custom Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="card modal-card" style={{ maxWidth: '440px', width: '90%' }}>
            <button onClick={() => setShowCategoryModal(false)} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '6px' }}>
              {language === 'id' ? 'Kelola Kategori Vendor' : 'Manage Vendor Categories'}
            </h3>
            <p className="subtitle" style={{ fontSize: '0.82rem', marginBottom: '16px' }}>
              {language === 'id' ? 'Tambah kategori baru atau hapus kategori kustom yang tidak diperlukan.' : 'Add new categories or delete custom ones as needed.'}
            </p>
            
            {/* Form Tambah Kategori */}
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                required 
                placeholder={language === 'id' ? 'Kategori baru (cth: Bulan Madu)...' : 'New category (e.g. Honeymoon)...'} 
                className="form-input" 
                style={{ flex: 1, fontSize: '0.88rem' }}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} />
                <span>{language === 'id' ? 'Tambah' : 'Add'}</span>
              </button>
            </form>

            {/* List Kategori Kustom dengan Tombol Hapus */}
            <div className="custom-categories-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {language === 'id' ? 'Kategori Kustom Anda' : 'Your Custom Categories'}
                </h4>
                {unusedCustomCategories.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleCleanUnusedCategories}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--color-danger)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title={language === 'id' ? 'Hapus semua kategori kustom yang tidak memiliki vendor' : 'Remove all custom categories without vendors'}
                  >
                    {language === 'id' ? `Bersihkan (${unusedCustomCategories.length} kosong)` : `Clean (${unusedCustomCategories.length} unused)`}
                  </button>
                )}
              </div>
              {customCategories && customCategories.length > 0 ? (
                <div className="custom-categories-list">
                  {customCategories.map(cat => {
                    const count = vendors.filter(v => v.category === cat).length;
                    return (
                      <div key={cat} className="custom-category-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="custom-category-name">{cat}</span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 600, 
                            color: count > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                            background: 'var(--color-background)', 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            border: '1px solid var(--color-border)'
                          }}>
                            {count} {language === 'id' ? 'vendor' : 'vendors'}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setDeletingCategory(cat)} 
                          className="btn-icon-danger-small"
                          title={language === 'id' ? `Hapus kategori "${cat}"` : `Delete "${cat}"`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '8px 0 16px 0' }}>
                  {language === 'id' ? 'Belum ada kategori kustom tambahan.' : 'No custom categories yet.'}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-secondary" style={{ padding: '8px 20px' }}>
                {language === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Custom Category Deletion */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => {
          if (!isDeleting) setDeletingCategory(null);
        }}
        onConfirm={async () => {
          if (!deletingCategory) return;
          try {
            setIsDeleting(true);
            await handleDeleteCustomCategory(deletingCategory);
            setDeletingCategory(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus kategori ini?' : 'Delete this category?'}
        message={language === 'id' ? `Semua vendor dengan kategori ini akan dialihkan ke "${BASE_CATEGORIES[0] || 'Venue'}".` : `All vendors with this category will be changed to "${BASE_CATEGORIES[0] || 'Venue'}".`}
        itemName={deletingCategory || ''}
        confirmText={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />

      {/* Confirmation Modal for Vendor Deletion */}
      <ConfirmModal
        isOpen={!!deletingVendor}
        onClose={() => {
          if (!isDeleting) setDeletingVendor(null);
        }}
        onConfirm={async () => {
          if (!deletingVendor) return;
          try {
            setIsDeleting(true);
            await deleteVendor(deletingVendor.id);
            setDeletingVendor(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus Vendor?' : 'Delete Vendor?'}
        message={language === 'id' ? 'Data vendor yang dihapus tidak dapat dikembalikan.' : 'Deleted vendor data cannot be recovered.'}
        itemName={deletingVendor?.name || ''}
        confirmText={language === 'id' ? 'Hapus Vendor' : 'Delete Vendor'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};

export default Vendor;
