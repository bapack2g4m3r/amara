import { useState, useEffect, useMemo } from 'react';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Sparkles, RefreshCw, 
  Trash2, Ban, Search, Filter, ExternalLink, Users, CheckCircle, 
  Clock, Award, MessageCircle, X, Shield, Mail, Calendar, 
  Heart, UserCheck, UserX, AlertTriangle, ShoppingBag, Edit3, RotateCcw,
  Tag, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useWeddingStore from '../store/useWeddingStore';
import { 
  getStoredAffiliates, 
  saveStoredAffiliates, 
  resetStoredAffiliates, 
  SESERAHAN_CATEGORIES 
} from '../data/seserahanAffiliates';
import { formatThousand, parseThousand } from '../utils/currencyFormatter';
import '../styles/Admin.css';

const Admin = () => {
  const { user } = useAuthStore();
  const { myProfile } = useWeddingStore();

  // Active top tab: 'codes' | 'users' | 'affiliates'
  const [activeTab, setActiveTab] = useState('codes');

  // --- ACCESS CODES STATE ---
  const [codes, setCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [codeError, setCodeError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // --- AFFILIATES STATE ---
  const [affiliatesList, setAffiliatesList] = useState(() => getStoredAffiliates());
  const [affiliateSearchTerm, setAffiliateSearchTerm] = useState('');
  const [affiliateCategoryFilter, setAffiliateCategoryFilter] = useState('all');
  const [affiliateTierFilter, setAffiliateTierFilter] = useState('all');

  // Affiliate Modal States
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [editingAffiliateProduct, setEditingAffiliateProduct] = useState(null);
  const [affiliateForm, setAffiliateForm] = useState({
    categoryId: 'al-quran',
    brand: '',
    name: '',
    price: '',
    tier: 'Pilihan hemat',
    checkedDate: 'Sep 2026',
    link: '',
    image: ''
  });
  const [deletingAffiliateProduct, setDeletingAffiliateProduct] = useState(null);
  const [showResetAffiliatesModal, setShowResetAffiliatesModal] = useState(false);

  // Modals state
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states for Single Code
  const [newCodeType, setNewCodeType] = useState('trial');
  const [customCode, setCustomCode] = useState('');
  const [codeNote, setCodeNote] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [creating, setCreating] = useState(false);

  // Copied state tracker
  const [copiedId, setCopiedId] = useState(null);

  // --- USERS STATE ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Show toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to generate a clean random code
  const generateRandomCode = (prefix = 'AMR') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}-${p1}-${p2}`;
  };

  // Fetch all codes
  const fetchCodes = async () => {
    setLoadingCodes(true);
    setCodeError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setCodes(data || []);
    } catch (err) {
      console.error('Error fetching access codes:', err);
      setCodeError(err.message || 'Gagal memuat daftar kode akses');
    } finally {
      setLoadingCodes(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc('admin_get_all_users');
      if (rpcErr) throw rpcErr;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUserError(err.message || 'Gagal memuat daftar pengguna');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchCodes();
    fetchUsers();
  }, []);

  // Handle single code creation
  const handleCreateSingleCode = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const codeToUse = customCode.trim() 
        ? customCode.trim().toUpperCase() 
        : generateRandomCode(newCodeType === 'trial' ? 'TRL' : 'AMR');

      const payload = {
        code: codeToUse,
        type: newCodeType,
        duration_days: newCodeType === 'trial' ? Number(durationDays) || 14 : null,
        note: codeNote.trim() || (newCodeType === 'trial' ? 'Free Trial' : 'Lisensi'),
        max_uses: 1,
        used_count: 0,
        status: 'active',
        created_by: user?.id || null
      };

      const { data, error: insertErr } = await supabase
        .from('access_codes')
        .insert([payload])
        .select();

      if (insertErr) throw insertErr;

      showToast(`Kode ${codeToUse} berhasil dibuat!`);
      setShowSingleModal(false);
      setCustomCode('');
      setCodeNote('');
      fetchCodes();
    } catch (err) {
      alert('Gagal membuat kode: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Revoke code
  const handleRevoke = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
    const confirmMsg = nextStatus === 'revoked' 
      ? 'Nonaktifkan kode ini? Pengguna tidak akan bisa mendaftar dengan kode ini.'
      : 'Aktifkan kembali kode ini?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const { error: updateErr } = await supabase
        .from('access_codes')
        .update({ status: nextStatus })
        .eq('id', id);

      if (updateErr) throw updateErr;
      showToast(`Status kode berhasil diubah jadi ${nextStatus}`);
      fetchCodes();
    } catch (err) {
      alert('Gagal mengubah status kode: ' + err.message);
    }
  };

  // Delete code
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kode ini secara permanen?')) return;
    try {
      const { error: delErr } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      showToast('Kode berhasil dihapus');
      fetchCodes();
    } catch (err) {
      alert('Gagal menghapus kode: ' + err.message);
    }
  };

  // Toggle user admin role
  const handleToggleUserAdmin = async (targetUser) => {
    const isSelf = targetUser.id === user?.id || targetUser.email === 'agung5s7@gmail.com';
    if (isSelf) {
      alert('Anda tidak dapat mencabut status admin Anda sendiri.');
      return;
    }

    const nextIsAdmin = !targetUser.is_admin;
    const confirmMsg = nextIsAdmin
      ? `Jadikan ${targetUser.email} sebagai Administrator Amara?`
      : `Cabut akses Administrator dari ${targetUser.email}?`;

    if (!window.confirm(confirmMsg)) return;

    setUserActionLoading(true);
    try {
      const { data, error: toggleErr } = await supabase.rpc('admin_toggle_user_admin', {
        p_target_user_id: targetUser.id,
        p_new_is_admin: nextIsAdmin
      });

      if (toggleErr) throw toggleErr;
      showToast(data?.message || 'Status admin berhasil diperbarui');
      fetchUsers();
    } catch (err) {
      alert('Gagal mengubah role admin: ' + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  // Grant direct access (trial or paid) without code
  const handleGrantDirectAccess = async (targetUser, accessType = 'trial') => {
    const label = accessType === 'paid' ? 'Paid / Permanen (Lynk.id)' : 'Free Trial';
    const confirmMsg = `Berikan akses ${label} langsung untuk akun ${targetUser.email}?\n(Akun akan langsung aktif tanpa perlu kode).`;
    if (!window.confirm(confirmMsg)) return;

    setUserActionLoading(true);
    try {
      const { data, error: grantErr } = await supabase.rpc('admin_grant_direct_access', {
        p_target_user_id: targetUser.id,
        p_access_type: accessType
      });

      if (grantErr) throw grantErr;
      showToast(data?.message || `Akses ${accessType} berhasil diberikan!`);
      fetchUsers();
    } catch (err) {
      alert('Gagal memberikan akses: ' + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  // Revoke direct access (locks user back to gatekeeper)
  const handleRevokeDirectAccess = async (targetUser) => {
    const confirmMsg = `Kunci kembali akses Amara untuk akun ${targetUser.email}?\n(Pengguna akan dicegat di layar aktivasi).`;
    if (!window.confirm(confirmMsg)) return;

    setUserActionLoading(true);
    try {
      const { data, error: revokeErr } = await supabase.rpc('admin_revoke_direct_access', {
        p_target_user_id: targetUser.id
      });

      if (revokeErr) throw revokeErr;
      showToast(data?.message || 'Akses berhasil dikunci');
      fetchUsers();
    } catch (err) {
      alert('Gagal mengunci akses: ' + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  // Delete user permanently
  const handleDeleteUser = async (targetUser) => {
    const isSelf = targetUser.id === user?.id || targetUser.email === 'agung5s7@gmail.com';
    if (isSelf) {
      alert('Demi keamanan, Anda tidak dapat menghapus akun Superadmin Anda sendiri.');
      return;
    }

    const confirmMsg = `PERINGATAN: Apakah Anda yakin ingin menghapus akun ${targetUser.email}?\n\nSeluruh data profil, to-do list, anggaran, vendor, dan daftar tamu yang bersangkutan akan terhapus permanen!`;
    if (!window.confirm(confirmMsg)) return;

    setUserActionLoading(true);
    try {
      const { data, error: delErr } = await supabase.rpc('admin_delete_user', {
        p_target_user_id: targetUser.id
      });

      if (delErr) throw delErr;
      showToast(data?.message || 'Pengguna berhasil dihapus');
      fetchUsers();
    } catch (err) {
      alert('Gagal menghapus pengguna: ' + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  // Copy shareable link / WA text
  const copyShareLink = (codeItem, isWhatsapp = false) => {
    const origin = window.location.origin;
    const shareUrl = `${origin}/?code=${codeItem.code}`;

    let textToCopy = shareUrl;
    if (isWhatsapp) {
      const greeting = codeItem.note ? `Halo! Khusus untukmu (${codeItem.note}), ` : 'Halo! ';
      textToCopy = `${greeting}ini akses eksklusif ke Amara Wedding Planner Dashboard:\n\n🔗 ${shareUrl}\n\nKode aksesmu: *${codeItem.code}*\n(Langsung klik link di atas untuk daftar tanpa ribet).`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(codeItem.id + (isWhatsapp ? '-wa' : '-code'));
      showToast(isWhatsapp ? 'Pesan WhatsApp berhasil disalin!' : 'Link registrasi disalin!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filtered list for Codes
  const filteredCodes = useMemo(() => {
    return codes.filter(item => {
      const matchesSearch = 
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.used_by_email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [codes, searchTerm, statusFilter, typeFilter]);

  // Filtered list for Users
  const filteredUsers = useMemo(() => {
    return users.filter(item => {
      const matchesSearch = 
        (item.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (item.display_name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (item.partner_1_name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (item.partner_2_name || '').toLowerCase().includes(userSearchTerm.toLowerCase());

      if (userRoleFilter === 'admin') return matchesSearch && item.is_admin;
      if (userRoleFilter === 'partner') return matchesSearch && (item.partner_1_name || item.wedding_date);
      if (userRoleFilter === 'google') return matchesSearch && item.provider === 'google';

      return matchesSearch;
    });
  }, [users, userSearchTerm, userRoleFilter]);

  // Metrics for Codes
  const codeStats = useMemo(() => {
    return {
      total: codes.length,
      active: codes.filter(c => c.status === 'active').length,
      used: codes.filter(c => c.status === 'used').length,
      paid: codes.filter(c => c.type === 'paid').length,
      trial: codes.filter(c => c.type === 'trial').length,
    };
  }, [codes]);

  // Metrics for Users
  const userStats = useMemo(() => {
    return {
      total: users.length,
      google: users.filter(u => u.provider === 'google').length,
      configured: users.filter(u => u.partner_1_name || u.wedding_date).length,
      admins: users.filter(u => u.is_admin).length,
    };
  }, [users]);

  // --- AFFILIATES COMPUTED & HANDLERS ---
  const allAffiliateProducts = useMemo(() => {
    const result = [];
    affiliatesList.forEach(cat => {
      if (Array.isArray(cat.products)) {
        cat.products.forEach(p => {
          result.push({
            ...p,
            categoryId: cat.id,
            categoryTitle: cat.title,
            categoryGroup: cat.category,
            categoryName: cat.categoryName
          });
        });
      }
    });
    return result;
  }, [affiliatesList]);

  const filteredAffiliateProducts = useMemo(() => {
    return allAffiliateProducts.filter(item => {
      const q = affiliateSearchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.categoryTitle.toLowerCase().includes(q) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q));

      const matchesCat = affiliateCategoryFilter === 'all' || 
        item.categoryId === affiliateCategoryFilter || 
        item.categoryGroup === affiliateCategoryFilter;

      const matchesTier = affiliateTierFilter === 'all' || item.tier === affiliateTierFilter;

      return matchesSearch && matchesCat && matchesTier;
    });
  }, [allAffiliateProducts, affiliateSearchTerm, affiliateCategoryFilter, affiliateTierFilter]);

  const affiliateStats = useMemo(() => {
    const total = allAffiliateProducts.length;
    const categoriesCount = affiliatesList.length;
    const totalVal = allAffiliateProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const avgPrice = total > 0 ? Math.round(totalVal / total) : 0;
    return { total, categoriesCount, avgPrice };
  }, [allAffiliateProducts, affiliatesList]);

  const handleOpenAddAffiliate = () => {
    setEditingAffiliateProduct(null);
    setAffiliateForm({
      categoryId: affiliatesList[0]?.id || 'al-quran',
      brand: '',
      name: '',
      price: '',
      tier: 'Pilihan hemat',
      checkedDate: 'Sep 2026',
      link: '',
      image: ''
    });
    setShowAffiliateModal(true);
  };

  const handleOpenEditAffiliate = (product) => {
    setEditingAffiliateProduct(product);
    setAffiliateForm({
      categoryId: product.categoryId,
      brand: product.brand || '',
      name: product.name || '',
      price: product.price ? formatThousand(product.price) : '',
      tier: product.tier || 'Pilihan hemat',
      checkedDate: product.checkedDate || 'Sep 2026',
      link: product.link || '',
      image: product.image || ''
    });
    setShowAffiliateModal(true);
  };

  const handleSaveAffiliateProduct = (e) => {
    e.preventDefault();
    if (!affiliateForm.name.trim()) {
      showToast('Nama produk wajib diisi!');
      return;
    }
    if (!affiliateForm.link.trim()) {
      showToast('Link affiliate Shopee wajib diisi!');
      return;
    }

    const priceNum = parseThousand(affiliateForm.price);
    const targetCatId = affiliateForm.categoryId;
    let updatedList = JSON.parse(JSON.stringify(affiliatesList));
    let targetCat = updatedList.find(c => c.id === targetCatId);

    if (!targetCat) {
      showToast('Kategori tidak ditemukan!');
      return;
    }

    if (editingAffiliateProduct) {
      const oldCatId = editingAffiliateProduct.categoryId;
      const prodId = editingAffiliateProduct.id;

      if (oldCatId === targetCatId) {
        targetCat.products = targetCat.products.map(p => {
          if (p.id === prodId) {
            return {
              ...p,
              brand: affiliateForm.brand.trim() || 'Brand',
              name: affiliateForm.name.trim(),
              price: priceNum,
              tier: affiliateForm.tier,
              checkedDate: affiliateForm.checkedDate || 'Sep 2026',
              link: affiliateForm.link.trim(),
              image: affiliateForm.image.trim() || p.image
            };
          }
          return p;
        });
      } else {
        const oldCat = updatedList.find(c => c.id === oldCatId);
        if (oldCat) {
          oldCat.products = oldCat.products.filter(p => p.id !== prodId);
        }
        targetCat.products.push({
          id: prodId,
          brand: affiliateForm.brand.trim() || 'Brand',
          name: affiliateForm.name.trim(),
          price: priceNum,
          tier: affiliateForm.tier,
          checkedDate: affiliateForm.checkedDate || 'Sep 2026',
          link: affiliateForm.link.trim(),
          image: affiliateForm.image.trim() || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300'
        });
      }
      showToast('Produk affiliate berhasil diperbarui!');
    } else {
      const newProdId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      targetCat.products.push({
        id: newProdId,
        brand: affiliateForm.brand.trim() || 'Brand',
        name: affiliateForm.name.trim(),
        price: priceNum,
        tier: affiliateForm.tier,
        checkedDate: affiliateForm.checkedDate || 'Sep 2026',
        link: affiliateForm.link.trim(),
        image: affiliateForm.image.trim() || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300'
      });
      showToast('Produk affiliate baru berhasil ditambahkan!');
    }

    setAffiliatesList(updatedList);
    saveStoredAffiliates(updatedList);
    setShowAffiliateModal(false);
    setEditingAffiliateProduct(null);
  };

  const handleDeleteAffiliateProduct = () => {
    if (!deletingAffiliateProduct) return;
    const { categoryId, id } = deletingAffiliateProduct;

    let updatedList = JSON.parse(JSON.stringify(affiliatesList));
    const targetCat = updatedList.find(c => c.id === categoryId);
    if (targetCat) {
      targetCat.products = targetCat.products.filter(p => p.id !== id);
    }

    setAffiliatesList(updatedList);
    saveStoredAffiliates(updatedList);
    setDeletingAffiliateProduct(null);
    showToast('Produk affiliate berhasil dihapus');
  };

  const handleResetAffiliates = () => {
    const defaultData = resetStoredAffiliates();
    setAffiliatesList(defaultData);
    setShowResetAffiliatesModal(false);
    showToast('Data affiliate berhasil di-reset ke bawaan sistem');
  };

  // Check admin authorization
  const isAdmin = myProfile?.is_admin === true || user?.email === 'agung5s7@gmail.com';

  if (!isAdmin && !loadingCodes) {
    return (
      <div className="admin-unauthorized-container">
        <div className="admin-unauthorized-card">
          <ShieldAlert size={48} className="unauthorized-icon" />
          <h2>Akses Terbatas</h2>
          <p>Halaman ini khusus untuk Administrator dan Pemilik Amara. Akun Anda tidak memiliki izin untuk mengelola kode akses.</p>
          <a href="/overview" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-title">
          <div className="admin-badge">
            <Shield size={14} />
            <span>Superadmin Amara</span>
          </div>
          <h1>Pusat Kontrol & Manajemen</h1>
          <p>Pantau seluruh akun pengguna Supabase, kelola Free Trial rekan, dan integrasikan serial key Lynk.id secara otomatis.</p>
        </div>

        {activeTab === 'codes' && (
          <div className="admin-header-actions">
            <button 
              className="btn-admin-primary" 
              onClick={() => setShowSingleModal(true)}
            >
              <Plus size={16} />
              <span>Buat Kode Akses</span>
            </button>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="admin-header-actions">
            <button 
              className="btn-admin-secondary" 
              onClick={() => setShowResetAffiliatesModal(true)}
              title="Reset ke 57 produk acuan awal"
            >
              <RotateCcw size={16} />
              <span>Reset Default</span>
            </button>
            <button 
              className="btn-admin-primary" 
              onClick={handleOpenAddAffiliate}
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="admin-nav-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          <Key size={17} />
          <span>Kode Akses & Lisensi</span>
          <span className="admin-tab-pill">{codes.length}</span>
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={17} />
          <span>Daftar Pengguna Supabase</span>
          <span className="admin-tab-pill">{users.length}</span>
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'affiliates' ? 'active' : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          <ShoppingBag size={17} />
          <span>Rekomendasi Affiliate</span>
          <span className="admin-tab-pill">{allAffiliateProducts.length}</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: KODE AKSES & LISENSI */}
      {/* ===================================================================== */}
      {activeTab === 'codes' && (
        <>
          {/* Stats Overview */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon-wrapper total">
                <Key size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Kode Dibuat</span>
                <h3 className="stat-value">{codeStats.total}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper active">
                <CheckCircle size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Kode Aktif (Siap Pakai)</span>
                <h3 className="stat-value">{codeStats.active}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper used">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Kode Terpakai (Registrasi)</span>
                <h3 className="stat-value">{codeStats.used}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper paid">
                <Award size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Lisensi Berbayar (Lynk.id)</span>
                <h3 className="stat-value">{codeStats.paid}</h3>
              </div>
            </div>
          </div>

          {/* Controls: Search & Filters */}
          <div className="admin-controls-card">
            <div className="admin-search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan kode, catatan, atau email pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filters">
              <div className="filter-item">
                <Filter size={14} className="filter-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="used">Terpakai</option>
                  <option value="revoked">Dinonaktifkan</option>
                </select>
              </div>

              <div className="filter-item">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">Semua Tipe</option>
                  <option value="trial">Free Trial</option>
                  <option value="paid">Paid (Lynk.id)</option>
                </select>
              </div>

              <button className="btn-refresh" onClick={fetchCodes} title="Muat Ulang Data">
                <RefreshCw size={15} className={loadingCodes ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {/* Codes Table */}
          <div className="admin-table-card">
            {loadingCodes ? (
              <div className="admin-table-loading">
                <RefreshCw size={24} className="spinning" />
                <p>Memuat data kode akses...</p>
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="admin-table-empty">
                <Key size={40} className="empty-icon" />
                <h4>Tidak ada kode akses ditemukan</h4>
                <p>Klik tombol di atas untuk membuat kode akses manual atau pantau transaksi otomatis dari Lynk.id.</p>
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Akses</th>
                      <th>Tipe</th>
                      <th>Catatan / Penerima</th>
                      <th>Status</th>
                      <th>Pengguna / Email</th>
                      <th>Waktu Pakai</th>
                      <th style={{ textAlign: 'right' }}>Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCodes.map((item) => {
                      const isUsed = item.status === 'used' || (item.used_count >= item.max_uses);
                      const isRevoked = item.status === 'revoked';

                      return (
                        <tr key={item.id} className={`table-row-${item.status}`}>
                          <td>
                            <div className="code-pill-wrapper">
                              <code className="code-pill">{item.code}</code>
                              <button 
                                className="btn-copy-mini" 
                                title="Salin Kode"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.code);
                                  setCopiedId(item.id + '-code');
                                  showToast(`Kode ${item.code} disalin!`);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }}
                              >
                                {copiedId === item.id + '-code' ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`type-badge type-${item.type}`}>
                              {item.type === 'trial' ? `Trial (${item.duration_days || 14}h)` : 'Paid (Lynk.id)'}
                            </span>
                          </td>
                          <td>
                            <div className="cell-note" title={item.note || '-'}>
                              {item.note || '-'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill status-${item.status}`}>
                              {item.status === 'active' && 'Aktif'}
                              {item.status === 'used' && 'Terpakai'}
                              {item.status === 'revoked' && 'Nonaktif'}
                              {item.status === 'expired' && 'Kedaluwarsa'}
                            </span>
                          </td>
                          <td>
                            {item.used_by_email ? (
                              <div className="user-email-cell">
                                <span className="email-text">{item.used_by_email}</span>
                              </div>
                            ) : (
                              <span className="text-muted">Belum ada</span>
                            )}
                          </td>
                          <td>
                            {item.used_at ? (
                              <span className="date-cell">
                                {new Date(item.used_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="table-actions">
                              {/* 1-Click WhatsApp Share: untuk kode aktif yang belum terpakai */}
                              {!isUsed && !isRevoked && (
                                <button 
                                  className="action-btn wa-btn" 
                                  title="Salin Pesan WhatsApp Siap Kirim"
                                  onClick={() => copyShareLink(item, true)}
                                >
                                  <MessageCircle size={15} />
                                  <span>Bagikan</span>
                                </button>
                              )}

                              {/* Revoke / Restore */}
                              <button 
                                className={`action-btn ${isRevoked ? 'restore-btn' : 'revoke-btn'}`}
                                title={isRevoked ? 'Aktifkan Kembali Kode' : 'Nonaktifkan Kode'}
                                onClick={() => handleRevoke(item.id, item.status)}
                              >
                                <Ban size={15} />
                              </button>

                              {/* Delete */}
                              <button 
                                className="action-btn delete-btn" 
                                title="Hapus Riwayat Kode Secara Permanen"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DAFTAR PENGGUNA SUPABASE */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <>
          {/* User Stats Overview */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon-wrapper total">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Pengguna Terdaftar</span>
                <h3 className="stat-value">{userStats.total}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper active">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Login via Google</span>
                <h3 className="stat-value">{userStats.google}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper used">
                <Heart size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Pernikahan Dikonfigurasi</span>
                <h3 className="stat-value">{userStats.configured}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper paid">
                <Shield size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Superadmin</span>
                <h3 className="stat-value">{userStats.admins}</h3>
              </div>
            </div>
          </div>

          {/* Controls: Search & Filters for Users */}
          <div className="admin-controls-card">
            <div className="admin-search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama, email, atau pasangan..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
              {userSearchTerm && (
                <button className="btn-clear-search" onClick={() => setUserSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filters">
              <div className="filter-item">
                <Filter size={14} className="filter-icon" />
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                  <option value="all">Semua Pengguna</option>
                  <option value="admin">Hanya Superadmin</option>
                  <option value="partner">Pernikahan Aktif</option>
                  <option value="google">Provider Google</option>
                </select>
              </div>

              <button className="btn-refresh" onClick={fetchUsers} title="Muat Ulang Pengguna">
                <RefreshCw size={15} className={loadingUsers ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-card">
            {loadingUsers ? (
              <div className="admin-table-loading">
                <RefreshCw size={24} className="spinning" />
                <p>Mengambil data seluruh pengguna dari Supabase...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="admin-table-empty">
                <Users size={40} className="empty-icon" />
                <h4>Tidak ada pengguna ditemukan</h4>
                <p>Pengguna yang mendaftar akan otomatis muncul di sini secara real-time.</p>
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Detail Pernikahan</th>
                      <th>Status Lisensi</th>
                      <th>Role</th>
                      <th>Terdaftar</th>
                      <th style={{ textAlign: 'right' }}>Kelola Akun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === user?.id || u.email === 'agung5s7@gmail.com';
                      const initial = (u.display_name || u.email || 'A').charAt(0).toUpperCase();

                      return (
                        <tr key={u.id} className={u.is_admin ? 'table-row-admin' : ''}>
                          <td>
                            <div className="user-profile-cell">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="Avatar" className="user-avatar-img" />
                              ) : (
                                <div className="user-avatar-placeholder">
                                  {initial}
                                </div>
                              )}
                              <div className="user-info-text">
                                <div className="user-name-line">
                                  <span className="user-display-name">{u.display_name}</span>
                                  {isSelf && <span className="self-badge">Anda</span>}
                                </div>
                                <div className="user-email-row">
                                  <span className="user-email-sub">{u.email}</span>
                                  {u.provider === 'google' ? (
                                    <span className="provider-mini-badge" title="Login Google">
                                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 12, height: 12 }} />
                                    </span>
                                  ) : (
                                    <span className="provider-mini-badge" title="Login Email">
                                      <Mail size={11} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            {u.partner_1_name || u.partner_2_name ? (
                              <div className="wedding-info-cell">
                                <span className="couple-names">
                                  {u.partner_1_name || 'CPP'} & {u.partner_2_name || 'CPW'}
                                </span>
                                {u.wedding_date && (
                                  <span className="wedding-date-sub">
                                    <Calendar size={11} />
                                    {new Date(u.wedding_date).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">Belum Diatur</span>
                            )}
                          </td>

                          <td>
                            {u.is_admin ? (
                              <span className="type-badge type-paid">Superadmin</span>
                            ) : (u.has_access || u.license_type) ? (
                              <span className={`type-badge ${u.license_type === 'paid' ? 'type-paid' : 'type-trial'}`}>
                                {u.license_type === 'paid' ? 'Paid (Lynk.id)' : u.license_type === 'trial' ? 'Free Trial' : u.license_type === 'partner' ? 'Pasangan' : 'Akses Aktif'}
                              </span>
                            ) : (
                              <span className="type-badge type-locked">Terkunci</span>
                            )}
                          </td>

                          <td>
                            {u.is_admin ? (
                              <span className="role-badge role-admin">
                                <Shield size={11} />
                                <span>Superadmin</span>
                              </span>
                            ) : (
                              <span className="role-badge role-user">Member</span>
                            )}
                          </td>

                          <td>
                            <span className="date-cell">
                              {new Date(u.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </td>

                          <td>
                            <div className="table-actions">
                              {/* Direct Access Grant / Revoke */}
                              {!isSelf && (
                                (u.has_access || u.license_type) ? (
                                  <button 
                                    className="action-btn revoke-access-btn" 
                                    title="Kunci kembali akses Amara untuk akun ini"
                                    onClick={() => handleRevokeDirectAccess(u)}
                                    disabled={userActionLoading}
                                  >
                                    <Ban size={13} />
                                    <span>Kunci</span>
                                  </button>
                                ) : (
                                  <div className="grant-access-group">
                                    <button 
                                      className="action-btn grant-trial-btn" 
                                      title="Beri Free Trial langsung tanpa kode"
                                      onClick={() => handleGrantDirectAccess(u, 'trial')}
                                      disabled={userActionLoading}
                                    >
                                      <Sparkles size={12} />
                                      <span>Trial</span>
                                    </button>
                                    <button 
                                      className="action-btn grant-paid-btn" 
                                      title="Beri Akses Paid / Lynk.id langsung tanpa kode"
                                      onClick={() => handleGrantDirectAccess(u, 'paid')}
                                      disabled={userActionLoading}
                                    >
                                      <Award size={12} />
                                      <span>Paid</span>
                                    </button>
                                  </div>
                                )
                              )}

                              {/* Toggle Admin */}
                              {!isSelf && (
                                <button 
                                  className={`action-btn ${u.is_admin ? 'revoke-admin-btn' : 'grant-admin-btn'}`}
                                  title={u.is_admin ? 'Cabut Status Admin' : 'Jadikan Admin'}
                                  onClick={() => handleToggleUserAdmin(u)}
                                  disabled={userActionLoading}
                                >
                                  {u.is_admin ? <UserX size={13} /> : <UserCheck size={13} />}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isSelf && (
                                <button 
                                  className="action-btn delete-btn" 
                                  title="Hapus Akun Pengguna Secara Permanen"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={userActionLoading}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: REKOMENDASI AFFILIATE */}
      {/* ===================================================================== */}
      {activeTab === 'affiliates' && (
        <>
          {/* Stats Overview */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon-wrapper total">
                <ShoppingBag size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Produk Affiliate</span>
                <h3 className="stat-value">{affiliateStats.total}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper active">
                <Tag size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Kategori Seserahan</span>
                <h3 className="stat-value">{affiliateStats.categoriesCount}</h3>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-wrapper used">
                <Sparkles size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Rata-rata Harga Rekomendasi</span>
                <h3 className="stat-value">Rp {affiliateStats.avgPrice.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>

          {/* Controls: Search and Filters */}
          <div className="admin-controls-card">
            <div className="admin-search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari nama produk, brand, atau kategori..." 
                value={affiliateSearchTerm}
                onChange={(e) => setAffiliateSearchTerm(e.target.value)}
              />
              {affiliateSearchTerm && (
                <button className="btn-clear-search" onClick={() => setAffiliateSearchTerm('')}>
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="admin-filters">
              <div className="filter-item">
                <Filter size={15} className="filter-icon" />
                <select 
                  value={affiliateCategoryFilter}
                  onChange={(e) => setAffiliateCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori ({allAffiliateProducts.length})</option>
                  {affiliatesList.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.products?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <select 
                  value={affiliateTierFilter}
                  onChange={(e) => setAffiliateTierFilter(e.target.value)}
                >
                  <option value="all">Semua Tier Rekomendasi</option>
                  <option value="Pilihan hemat">Pilihan hemat</option>
                  <option value="Populer">Populer</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Affiliate Products */}
          <div className="admin-table-card">
            {filteredAffiliateProducts.length === 0 ? (
              <div className="admin-table-empty">
                <ShoppingBag size={40} className="empty-icon" />
                <h4>Tidak Ada Produk Ditemukan</h4>
                <p>Tidak ada produk rekomendasi yang sesuai dengan kata kunci pencarian atau filter yang dipilih.</p>
                <button 
                  className="btn-admin-primary" 
                  style={{ marginTop: '12px' }}
                  onClick={handleOpenAddAffiliate}
                >
                  <Plus size={16} />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Produk & Brand</th>
                      <th style={{ width: '15%' }}>Kategori</th>
                      <th style={{ width: '12%' }}>Tier</th>
                      <th style={{ width: '14%' }}>Harga Acuan</th>
                      <th style={{ width: '14%', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAffiliateProducts.map((prod) => (
                      <tr key={`${prod.categoryId}-${prod.id}`}>
                        <td>
                          <div className="admin-product-cell">
                            <img 
                              src={prod.image} 
                              alt={prod.name}
                              className="admin-product-thumb"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100';
                              }}
                            />
                            <div className="admin-product-details">
                              <span className="admin-product-brand">{prod.brand || 'Brand'}</span>
                              <span className="admin-product-title" title={prod.name}>
                                {prod.name}
                              </span>
                              <div style={{ marginTop: '3px' }}>
                                <a 
                                  href={prod.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="admin-link-btn"
                                  title="Cek link pembelian Shopee"
                                >
                                  <span>Buka Link Shopee</span>
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-category-badge">{prod.categoryTitle}</span>
                        </td>
                        <td>
                          <span className={`type-badge ${
                            prod.tier === 'Pilihan hemat' ? 'tier-badge-hemat' :
                            prod.tier === 'Populer' ? 'tier-badge-populer' : 'tier-badge-premium'
                          }`}>
                            {prod.tier || 'Populer'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-price-cell">
                            Rp {Number(prod.price || 0).toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="action-btn btn-edit-action"
                              title="Edit Produk Affiliate (Nama, Harga, Link, Foto)"
                              onClick={() => handleOpenEditAffiliate(prod)}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="action-btn btn-delete-action"
                              title="Hapus Produk dari Rekomendasi"
                              onClick={() => setDeletingAffiliateProduct(prod)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: Create Single Code */}
      {showSingleModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSingleModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Key size={20} className="modal-icon" />
                <h3>Buat Kode Akses Baru</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowSingleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSingleCode} className="admin-form">
              <div className="form-group">
                <label>Tipe Akses</label>
                <div className="type-toggle-group">
                  <button 
                    type="button" 
                    className={`toggle-btn ${newCodeType === 'trial' ? 'selected' : ''}`}
                    onClick={() => setNewCodeType('trial')}
                  >
                    <Clock size={16} />
                    <span>Free Trial</span>
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-btn ${newCodeType === 'paid' ? 'selected' : ''}`}
                    onClick={() => setNewCodeType('paid')}
                  >
                    <Award size={16} />
                    <span>Paid / Lisensi Penuh</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Catatan / Nama Rekan Penerima</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Trial untuk Budi & Pasangan" 
                  value={codeNote}
                  onChange={(e) => setCodeNote(e.target.value)}
                  required
                />
              </div>

              {newCodeType === 'trial' && (
                <div className="form-group">
                  <label>Durasi Free Trial (Hari)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="365" 
                    value={durationDays} 
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>
                  Kode Kustom <span className="label-sub">(Opsional, kosongkan jika ingin di-generate otomatis)</span>
                </label>
                <div className="input-with-action">
                  <input 
                    type="text" 
                    placeholder={newCodeType === 'trial' ? 'Contoh: TRL-BUDI-2026' : 'Contoh: AMR-VIP-01'}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <button 
                    type="button" 
                    className="btn-randomize" 
                    onClick={() => setCustomCode(generateRandomCode(newCodeType === 'trial' ? 'TRL' : 'AMR'))}
                    title="Generate Acak"
                  >
                    <Sparkles size={14} />
                    <span>Acak</span>
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowSingleModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Membuat...' : 'Buat Kode Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Affiliate Product */}
      {showAffiliateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAffiliateModal(false)}>
          <div className="admin-modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <ShoppingBag size={20} className="modal-icon" color="#99182A" />
                <h3>{editingAffiliateProduct ? 'Edit Produk Affiliate' : 'Tambah Produk Affiliate Baru'}</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowAffiliateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAffiliateProduct} className="admin-form">
              <div className="form-group">
                <label>Pilih Kategori Seserahan <span style={{ color: '#99182A' }}>*</span></label>
                <select 
                  value={affiliateForm.categoryId}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, categoryId: e.target.value })}
                  required
                >
                  {affiliatesList.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.categoryName || cat.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Brand / Merk Toko</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Madinaquran / Tazbiya"
                    value={affiliateForm.brand}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tier Rekomendasi</label>
                  <select 
                    value={affiliateForm.tier}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, tier: e.target.value })}
                  >
                    <option value="Pilihan hemat">Pilihan hemat</option>
                    <option value="Populer">Populer</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nama Lengkap Produk <span style={{ color: '#99182A' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: Alquran Tajwid Warna Terjemah QRCode Heekaya Hardcover"
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Harga Acuan Toko (Rp) <span style={{ color: '#99182A' }}>*</span></label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Contoh: 119.000"
                    value={affiliateForm.price}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, price: formatThousand(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bulan Pengecekan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Sep 2026"
                    value={affiliateForm.checkedDate}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, checkedDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Link Shopee Affiliate <span style={{ color: '#99182A' }}>*</span></label>
                <input 
                  type="url" 
                  placeholder="https://s.shopee.co.id/..."
                  value={affiliateForm.link}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, link: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>URL Foto Produk (CDN Shopee / Gambar)</label>
                <input 
                  type="url" 
                  placeholder="https://down-id.img.susercontent.com/file/..."
                  value={affiliateForm.image}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, image: e.target.value })}
                />
                <div className="admin-image-preview-group">
                  <div className="admin-image-preview-box">
                    {affiliateForm.image ? (
                      <img 
                        src={affiliateForm.image} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100';
                        }}
                      />
                    ) : (
                      <ImageIcon size={22} color="#94A3B8" />
                    )}
                  </div>
                  <div className="admin-image-preview-help">
                    <strong>Preview Foto:</strong> Masukkan URL gambar produk. Pastikan format tautan gambar valid dan dapat diakses publik.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAffiliateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>{editingAffiliateProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Affiliate Product Confirmation */}
      {deletingAffiliateProduct && (
        <div className="admin-modal-overlay" onClick={() => setDeletingAffiliateProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <AlertTriangle size={20} className="modal-icon text-danger" color="#99182A" />
                <h3 style={{ color: '#99182A' }}>Hapus Produk Rekomendasi?</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setDeletingAffiliateProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Apakah Anda yakin ingin menghapus produk <strong>{deletingAffiliateProduct.name}</strong> ({deletingAffiliateProduct.brand}) dari daftar rekomendasi kategori <strong>{deletingAffiliateProduct.categoryTitle}</strong>?
              </p>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '8px' }}>
                Produk ini tidak akan lagi muncul di rekomendasi seserahan calon pengantin.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setDeletingAffiliateProduct(null)}>
                Batal
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#99182A', borderColor: '#99182A' }}
                onClick={handleDeleteAffiliateProduct}
              >
                <Trash2 size={16} />
                <span>Ya, Hapus Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Reset Affiliates Confirmation */}
      {showResetAffiliatesModal && (
        <div className="admin-modal-overlay" onClick={() => setShowResetAffiliatesModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <RotateCcw size={20} className="modal-icon" color="#99182A" />
                <h3>Reset ke Data Bawaan?</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowResetAffiliatesModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Tindakan ini akan mengembalikan seluruh produk rekomendasi affiliate ke data acuan default awal (57 produk Shopee terpilih).
              </p>
              <p style={{ fontSize: '0.82rem', color: '#99182A', marginTop: '8px', fontWeight: 600 }}>
                Perubahan kustom yang telah Anda buat pada produk akan ditimpa dengan data default.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowResetAffiliatesModal(false)}>
                Batal
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleResetAffiliates}
              >
                <RotateCcw size={16} />
                <span>Konfirmasi Reset Default</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

