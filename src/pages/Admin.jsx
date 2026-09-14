import { useState, useEffect, useMemo } from 'react';
import { 
  Key, Plus, Copy, Check, ShieldAlert, Sparkles, RefreshCw, 
  Trash2, Ban, Search, Filter, ExternalLink, Users, CheckCircle, 
  Clock, Award, Layers, MessageCircle, X, Shield, Mail, Calendar, 
  Heart, UserCheck, UserX, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Admin.css';

const Admin = () => {
  const { user } = useAuthStore();
  const { myProfile } = useWeddingStore();

  // Active top tab: 'codes' | 'users'
  const [activeTab, setActiveTab] = useState('codes');

  // --- ACCESS CODES STATE ---
  const [codes, setCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [codeError, setCodeError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals state
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states for Single Code
  const [newCodeType, setNewCodeType] = useState('trial');
  const [customCode, setCustomCode] = useState('');
  const [codeNote, setCodeNote] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [creating, setCreating] = useState(false);

  // Form states for Batch Generation
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('Lynk.id Batch #1');
  const [batchType, setBatchType] = useState('paid');
  const [generatedBatchCodes, setGeneratedBatchCodes] = useState([]);

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

  // Handle batch generation for Lynk.id
  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const count = Math.min(Math.max(1, Number(batchCount) || 10), 100);
      const newItems = [];
      const prefix = batchType === 'paid' ? 'LYNK' : 'TRL';

      for (let i = 0; i < count; i++) {
        newItems.push({
          code: generateRandomCode(prefix),
          type: batchType,
          duration_days: batchType === 'trial' ? 14 : null,
          note: batchPrefix.trim() || `Lynk.id Batch ${new Date().toLocaleDateString('id-ID')}`,
          max_uses: 1,
          used_count: 0,
          status: 'active',
          created_by: user?.id || null
        });
      }

      const { data, error: batchErr } = await supabase
        .from('access_codes')
        .insert(newItems)
        .select();

      if (batchErr) throw batchErr;

      setGeneratedBatchCodes((data || newItems).map(item => item.code));
      showToast(`${count} Kode berhasil dibuat untuk Lynk.id!`);
      fetchCodes();
    } catch (err) {
      alert('Gagal generate batch kode: ' + err.message);
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
              className="btn-admin-secondary" 
              onClick={() => { setGeneratedBatchCodes([]); setShowBatchModal(true); }}
            >
              <Layers size={16} />
              <span>Batch Lynk.id</span>
            </button>
            <button 
              className="btn-admin-primary" 
              onClick={() => setShowSingleModal(true)}
            >
              <Plus size={16} />
              <span>Buat Kode Akses</span>
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
                <p>Klik tombol di atas untuk membuat kode trial baru atau generate batch Lynk.id.</p>
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

      {/* MODAL 2: Batch Generation for Lynk.id */}
      {showBatchModal && (
        <div className="admin-modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="admin-modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Layers size={20} className="modal-icon" />
                <h3>Generate Batch Kode untuk Lynk.id</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowBatchModal(false)}>
                <X size={18} />
              </button>
            </div>

            {generatedBatchCodes.length === 0 ? (
              <form onSubmit={handleGenerateBatch} className="admin-form">
                <p className="modal-info-text">
                  Gunakan fitur ini untuk membuat puluhan kode lisensi berbayar sekaligus. 
                  Daftar kode yang dihasilkan bisa langsung disalin dan ditempel ke pengaturan 
                  <strong> "Serial Key / Kode Digital" </strong> di produk Lynk.id Anda.
                </p>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Jumlah Kode yang Dibuat</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={batchCount}
                      onChange={(e) => setBatchCount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>Tipe Akses</label>
                    <select value={batchType} onChange={(e) => setBatchType(e.target.value)}>
                      <option value="paid">Paid (Lynk.id / Lisensi Penuh)</option>
                      <option value="trial">Free Trial</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Label / Catatan Batch</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Lynk.id Penjualan Batch 1" 
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowBatchModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? 'Men-generate...' : `Generate ${batchCount} Kode Sekarang`}
                  </button>
                </div>
              </form>
            ) : (
              <div className="batch-result-container">
                <div className="batch-result-header">
                  <CheckCircle size={20} color="#16a34a" />
                  <h4>{generatedBatchCodes.length} Kode Berhasil Dibuat!</h4>
                </div>
                <p className="batch-result-desc">
                  Salin semua kode di bawah ini untuk ditempelkan ke kolom serial key produk digital Lynk.id Anda:
                </p>

                <textarea 
                  className="batch-codes-textarea" 
                  readOnly 
                  rows={8}
                  value={generatedBatchCodes.join('\n')}
                  onClick={(e) => e.target.select()}
                />

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedBatchCodes.join('\n'));
                      showToast(`${generatedBatchCodes.length} Kode berhasil disalin ke clipboard!`);
                    }}
                  >
                    <Copy size={16} />
                    <span>Salin Semua Kode ke Clipboard</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => setShowBatchModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
