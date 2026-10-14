import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Star, Plus, X, Trash2, Edit2, Globe, Link, ExternalLink, CheckCircle, CheckCircle2, Wallet, ArrowUpRight, Sparkles, Layers } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import ConfirmModal from '../components/ConfirmModal';
import { formatThousand, parseThousand } from '../utils/currencyFormatter';
import TutorialTriggerButton from '../components/TutorialTriggerButton';
import UrlInputGroup from '../components/UrlInputGroup';
import { cleanUrlInput, formatUrl } from '../utils/urlHelper';
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
  const navigate = useNavigate();

  const {
    vendors = [],
    addVendor,
    updateVendor,
    deleteVendor,
    customCategories,
    addCustomCategory,
    updateCustomCategories,
    expenses = [],
    budgetPlans = [],
    activePlanId = 'plan_a',
    addExpense,
    updateExpense,
    deleteExpense,
    userRole
  } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const { t, language } = useTranslation();

  // Ensure latest dashboard data (expenses, plans) from database is synced when page mounts
  useEffect(() => {
    useWeddingStore.getState().fetchDashboardData(true);
  }, []);

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

    const payload = {
      name: vendorForm.name,
      category: vendorForm.category,
      description: vendorForm.description,
      note: vendorForm.note,
      website_url: cleanUrlInput(vendorForm.website_url),
      social_media_url: cleanUrlInput(vendorForm.social_media_url) || vendorForm.social_media_url.trim(),
      contact_name: vendorForm.contact_name?.trim() || null,
      contact_phone: vendorForm.contact_phone?.trim() || null,
      price: parseThousand(vendorForm.price),
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
      price: vendor.price ? formatThousand(vendor.price) : '',
      rating: vendor.rating
    });
    setShowModal(true);
  };

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const [toastAction, setToastAction] = useState(null);

  const showToast = (msg, action = null) => {
    setToastMessage(msg);
    setToastAction(action);
    setTimeout(() => {
      setToastMessage(null);
      setToastAction(null);
    }, action ? 5000 : 3000);
  };

  const handleToggleBudgeting = async (vendor) => {
    if (isReadOnly) return;

    if (!vendor.is_chosen) {
      // Adding vendor to budgeting
      const price = Number(vendor.price) || 0;
      if (price === 0) {
        showToast(
          language === 'id' 
            ? 'Isi estimasi harga vendor terlebih dahulu untuk memasukkannya ke Budgeting' 
            : 'Please set vendor price first to add to Budgeting',
          { label: language === 'id' ? 'Isi Harga' : 'Edit', onClick: () => handleEdit(vendor) }
        );
        return;
      }

      await updateVendor(vendor.id, { is_chosen: true });

      try {
        const vCat = vendor.category || 'Vendor';
        const targetPlan = (budgetPlans || []).find(p => p.id === (activePlanId || 'plan_a')) || { name: 'Plan A' };
        let isUpdate = false;

        // 1. Check if an expense already linked to this vendor exists in active plan
        const alreadyLinked = (expenses || []).find(e => 
          (e.plan_id || 'plan_a') === (activePlanId || 'plan_a') &&
          (e.vendor_name === vendor.name || (e.title === vendor.name && e.category === vCat))
        );

        if (alreadyLinked) {
          isUpdate = true;
          await updateExpense(alreadyLinked.id, {
            planned_amount: price,
            amount: alreadyLinked.actual_amount ? alreadyLinked.amount : price,
            vendor_name: vendor.name,
            title: alreadyLinked.title && alreadyLinked.title !== 'Keterangan' ? alreadyLinked.title : vendor.name
          });
        } else {
          // 2. Check if there is an empty/placeholder expense in this category with no vendor & 0 planned
          const emptyPlaceholder = (expenses || []).find(e => 
            (e.plan_id || 'plan_a') === (activePlanId || 'plan_a') &&
            (e.category || '').toLowerCase() === vCat.toLowerCase() &&
            !e.vendor_name &&
            (!e.planned_amount || Number(e.planned_amount) === 0) &&
            (!e.actual_amount || Number(e.actual_amount) === 0)
          );

          if (emptyPlaceholder) {
            isUpdate = true;
            await updateExpense(emptyPlaceholder.id, {
              title: vendor.name,
              vendor_name: vendor.name,
              planned_amount: price,
              amount: price,
              notes: `Dari Vendor: ${vendor.name}`
            });
          } else {
            // 3. Otherwise add new expense row for this vendor
            await addExpense({
              category: vCat,
              title: vendor.name,
              planned_amount: price,
              actual_amount: 0,
              paid_amount: 0,
              amount: price,
              vendor_name: vendor.name,
              plan_id: activePlanId || 'plan_a',
              notes: `Dari Vendor: ${vendor.name}`
            });
          }
        }

        const successText = isUpdate
          ? (language === 'id' 
              ? `"${vendor.name}" (${formatCurrency(price)}) berhasil diperbarui di ${targetPlan.name}!` 
              : `"${vendor.name}" (${formatCurrency(price)}) successfully updated in ${targetPlan.name}!`)
          : (language === 'id'
              ? `"${vendor.name}" (${formatCurrency(price)}) berhasil ditambahkan ke ${targetPlan.name}!`
              : `"${vendor.name}" (${formatCurrency(price)}) added to ${targetPlan.name}!`);

        showToast(
          successText,
          {
            label: language === 'id' ? 'Lihat di Budgeting' : 'View in Budget',
            onClick: () => navigate('/budget?tab=budgeting')
          }
        );
      } catch (err) {
        console.error('Error adding vendor to budgeting:', err);
      }
    } else {
      // Removing vendor from budgeting
      await updateVendor(vendor.id, { is_chosen: false });

      try {
        const targetPlan = (budgetPlans || []).find(p => p.id === (activePlanId || 'plan_a')) || { name: 'Plan A' };
        // Find any expense linked to this vendor in active plan (by vendor_name or title)
        const linkedExpenses = (expenses || []).filter(e => 
          (e.plan_id || 'plan_a') === (activePlanId || 'plan_a') &&
          (e.vendor_name === vendor.name || (e.title === vendor.name && (!vendor.category || e.category === vendor.category)))
        );

        let hadPayments = false;
        for (const exp of linkedExpenses) {
          const hasPayments = (Number(exp.actual_amount) > 0) || (Number(exp.paid_amount) > 0);
          if (!hasPayments) {
            await deleteExpense(exp.id);
          } else {
            hadPayments = true;
            await updateExpense(exp.id, {
              vendor_name: '',
              notes: (exp.notes || '').replace(`Dari Vendor: ${vendor.name}`, '').trim()
            });
          }
        }

        if (hadPayments) {
          showToast(
            language === 'id'
              ? `"${vendor.name}" dilepas dari ${targetPlan.name} (pos pembayaran tetap dipertahankan)`
              : `"${vendor.name}" unlinked from ${targetPlan.name} (payment record preserved)`
          );
        } else {
          showToast(
            language === 'id'
              ? `"${vendor.name}" berhasil dihapus dari ${targetPlan.name}`
              : `"${vendor.name}" removed from ${targetPlan.name}`
          );
        }
      } catch (err) {
        console.error('Error removing vendor from budgeting:', err);
        showToast(
          language === 'id'
            ? `"${vendor.name}" dihapus dari Budgeting`
            : `"${vendor.name}" removed from Budgeting`
        );
      }
    }
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
    const cleaned = cleanUrlInput(val) || val.trim();
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="vendor-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
          {toastAction && (
            <button
              type="button"
              className="vendor-toast-btn"
              onClick={toastAction.onClick}
            >
              {toastAction.label}
            </button>
          )}
        </div>
      )}

      <header className="page-header has-tutorial-btn">
        <div>
          <h1>{t('vendor.title')}</h1>
          <p className="subtitle">{t('vendor.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <TutorialTriggerButton />
          {!isReadOnly && (
            <button className="btn-primary" onClick={() => {
              setEditingVendorId(null);
              setVendorForm({ ...defaultForm, category: BASE_CATEGORIES[0] || 'Venue' });
              setShowModal(true);
            }}>
              <Plus size={16} /> {t('vendor.addVendor')}
            </button>
          )}
        </div>
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
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
          onClick={() => setActiveFilter(activeFilter === 'Chosen Vendors' ? 'All Vendors' : 'Chosen Vendors')}
          style={{ border: '1px solid var(--color-primary)', fontWeight: activeFilter === 'Chosen Vendors' ? 600 : 500, color: activeFilter === 'Chosen Vendors' ? 'white' : 'var(--color-primary)' }}
        >
          {language === 'id' ? 'Di Budgeting' : t('vendor.chosenVendors')} {chosenCount > 0 && `(${chosenCount})`}
        </span>
        <span
          className={`pill ${activeFilter === 'Favorite Vendors' ? 'active pill-favorite' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'Favorite Vendors' ? 'All Vendors' : 'Favorite Vendors')}
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
            {/* Header: Vendor Name + Favorite Button */}
            <div className="vendor-card-header">
              <div className="vendor-title-wrapper">
                <h3 className="vendor-name">{vendor.name}</h3>
                {vendor.is_chosen && (
                  <span className="badge-chosen-inline">
                    <CheckCircle size={12} /> {language === 'id' ? 'Di Budgeting' : 'In Budgeting'}
                  </span>
                )}
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
                <Heart size={18} fill={vendor.is_favorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Meta Row: Category Pill + Rating + Social / Web Links */}
            <div className="vendor-meta-row">
              <span className="category-tag">{displayCategory(vendor.category)}</span>
              <span className="rating"><Star size={15} fill="currentColor" /> {vendor.rating}</span>

              <div className="vendor-links">
                {vendor.social_media_url && (() => {
                  const { platform, url } = parseSocialInput(vendor.social_media_url);
                  return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="social-link" title={platform}>
                      {platform === 'instagram' ? (
                        <IconInstagram size={16} />
                      ) : platform === 'tiktok' ? (
                        <IconTikTok size={16} />
                      ) : (
                        <Link size={16} />
                      )}
                    </a>
                  );
                })()}
                {vendor.website_url && (
                  <a href={formatUrl(vendor.website_url)} target="_blank" rel="noopener noreferrer" className="website-link" title="Website">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Detail Paket */}
            {vendor.description && vendor.description.trim() ? (
              <div className="vendor-desc-container">
                <span className="vendor-desc-label">DETAIL PAKET:</span>
                <p className="vendor-desc">{vendor.description}</p>
              </div>
            ) : null}

            {/* Catatan / Note */}
            {vendor.note && (
              <div className="vendor-note-container">
                <strong>{t('vendor.note')}:</strong>
                <p>{vendor.note}</p>
              </div>
            )}

            {/* Price Row with dashed divider */}
            <div className="vendor-price-row">
              <span className="price" style={{ color: vendor.is_chosen ? '#059669' : 'var(--color-primary)' }}>
                {formatCurrency(vendor.price)}
              </span>
              {vendor.is_chosen && (
                <span className="price-chosen-indicator">
                  {language === 'id' ? '✓ Di Budgeting' : '✓ In Budgeting'}
                </span>
              )}
            </div>

            {/* Primary Action Button */}
            {!isReadOnly && (
              <div className="vendor-actions">
                {vendor.is_chosen ? (
                  <button
                    className="btn-vendor-toggle btn-chosen btn-full"
                    onClick={() => handleToggleBudgeting(vendor)}
                    title={language === 'id' ? 'Klik untuk menghapus vendor ini dari Budgeting' : 'Click to remove this vendor from Budgeting'}
                  >
                    <span className="state-default">
                      <CheckCircle size={16} />
                      <span>{language === 'id' ? 'Di Budgeting' : 'In Budgeting'}</span>
                    </span>
                    <span className="state-hover">
                      <X size={16} />
                      <span>{language === 'id' ? 'Hapus dari Budgeting' : 'Remove from Budgeting'}</span>
                    </span>
                  </button>
                ) : (
                  <button
                    className="btn-vendor-toggle btn-choose btn-full"
                    onClick={() => handleToggleBudgeting(vendor)}
                  >
                    <Plus size={16} />
                    <span>{language === 'id' ? 'Tambah ke Budgeting' : 'Add to Budgeting'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Edit & Delete Actions */}
            {!isReadOnly && (
              <div className="vendor-footer-actions">
                <button onClick={() => handleEdit(vendor)} className="action-btn action-btn-edit">
                  <Edit2 size={15} /> {t('vendor.edit')}
                </button>
                <button
                  onClick={() => setDeletingVendor(vendor)}
                  className="action-btn action-btn-delete danger"
                >
                  <Trash2 size={15} /> {t('vendor.delete')}
                </button>
              </div>
            )}
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
            <button onClick={() => setShowModal(false)} className="modal-close"><X size={24} /></button>
            <h3>{editingVendorId ? t('vendor.editVendor') : t('vendor.addVendor')}</h3>
            <form onSubmit={handleSaveVendor} className="vendor-form">
              <div className="form-group">
                <label>{t('vendor.vendorName')}</label>
                <input type="text" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} required className="form-input" />
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
                  onChange={e => setVendorForm({ ...vendorForm, description: e.target.value })}
                  className="form-textarea"
                  placeholder={t('vendor.placeholderDesc')}
                ></textarea>
              </div>

              <div className="form-group">
                <label>{t('vendor.note')}</label>
                <textarea
                  value={vendorForm.note}
                  onChange={e => setVendorForm({ ...vendorForm, note: e.target.value })}
                  className="form-textarea note-textarea"
                  placeholder={t('vendor.placeholderNote')}
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <UrlInputGroup
                    label={t('vendor.websiteUrl')}
                    placeholder="https://... atau amarawedding.id"
                    value={vendorForm.website_url}
                    onChange={cleanLink => setVendorForm({ ...vendorForm, website_url: cleanLink })}
                    helperText={language === 'id' ? 'Link website, katalog, atau toko online' : 'Website, catalog, or shop link'}
                  />
                </div>
                <div className="form-group">
                  <UrlInputGroup
                    label={t('vendor.socialMediaUrl')}
                    placeholder="https://instagram.com/... atau @username"
                    value={vendorForm.social_media_url}
                    onChange={cleanLink => setVendorForm({ ...vendorForm, social_media_url: cleanLink })}
                    helperText={language === 'id' ? 'Link Instagram, TikTok, atau ketik @username' : 'Instagram, TikTok, or @username'}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{language === 'id' ? 'Nama Kontak / PIC (Opsional)' : 'Contact Name / PIC (Optional)'}</label>
                  <input
                    type="text"
                    value={vendorForm.contact_name}
                    onChange={e => setVendorForm({ ...vendorForm, contact_name: e.target.value })}
                    placeholder="cth: Mbak Sarah / Mas Budi"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{language === 'id' ? 'No. Kontak / WhatsApp (Opsional)' : 'Contact / WhatsApp (Optional)'}</label>
                  <input
                    type="tel"
                    value={vendorForm.contact_phone}
                    onChange={e => setVendorForm({ ...vendorForm, contact_phone: e.target.value })}
                    placeholder="cth: 08123456789"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>{t('vendor.price')} (Rp)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Contoh: 15.000.000"
                    value={vendorForm.price} 
                    onChange={e => setVendorForm({ ...vendorForm, price: formatThousand(e.target.value) })} 
                    required 
                    className="form-input" 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{t('vendor.rating')}</label>
                  <input type="number" min="1" max="5" step="0.1" value={vendorForm.rating} onChange={e => setVendorForm({ ...vendorForm, rating: e.target.value })} required className="form-input" />
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
            <button onClick={() => setShowCategoryModal(false)} className="modal-close"><X size={20} /></button>
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
