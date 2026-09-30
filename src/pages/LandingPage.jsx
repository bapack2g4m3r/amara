import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  DollarSign,
  Gift,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Zap,
  Menu,
  X,
  Clock,
  Check,
  Briefcase,
  PieChart,
  ListChecks,
  ShieldCheck,
  Wallet,
  CalendarCheck,
  BarChart3,
  ClipboardList,
  UserCheck,
  Play,
  Search,
  Sparkles,
  User,
  Building2,
  TrendingUp,
} from 'lucide-react';
import '../styles/LandingPage.css';

import { LYNK_PURCHASE_URL } from '../config/appConfig';

const TikTokIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.86-4.47V8.71a8.21 8.21 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.86-.14z"/>
  </svg>
);

const InstagramIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('overview');
  const [scrolled, setScrolled] = useState(false);

  // Interactive demo states for realistic Amara app experience
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Fitting Baju Pengantin Akad & Resepsi (MUA & Attire)', pic: 'CPW', picName: 'Maipa', due: '12 Okt 2026', priority: 'Mendesak', completed: true },
    { id: 2, title: 'Pembayaran DP 50% Catering Wedding (500 Pax)', pic: 'CPP', picName: 'Dhova', due: '15 Okt 2026', priority: 'Mendesak', completed: false },
    { id: 3, title: 'Finalisasi Desain Undangan Digital & Cetak Hardcopy', pic: 'Bersama', picName: 'Bersama', due: '20 Okt 2026', priority: 'Sedang', completed: false },
    { id: 4, title: 'Technical Meeting bersama WO, Venue & Dekorasi', pic: 'Bersama', picName: 'Bersama', due: '28 Okt 2026', priority: 'Mendesak', completed: false },
  ]);

  const [demoActivitiesFilter, setDemoActivitiesFilter] = useState('all');
  const [demoGuestFilter, setDemoGuestFilter] = useState('all');
  const [demoGuestSearch, setDemoGuestSearch] = useState('');

  const [demoGuests] = useState([
    { id: 1, name: 'Kang Dedi Mulyadi (KDM)', initials: 'KD', category: 'Tamu CPP', type: 'VIP', pax: 2, status: 'Konfirmasi Hadir' },
    { id: 2, name: 'Tante Gito & Keluarga', initials: 'TG', category: 'Tamu CPW', type: 'Keluarga', pax: 4, status: 'Konfirmasi Hadir' },
    { id: 3, name: 'Wulan Guritno & Partner', initials: 'WG', category: 'Tamu CPP', type: 'VIP', pax: 2, status: 'Konfirmasi Hadir' },
    { id: 4, name: 'Keluarga Besar Bpk. Hendra', initials: 'BH', category: 'Tamu CPW', type: 'Keluarga', pax: 3, status: 'Belum Konfirmasi' },
    { id: 5, name: 'Rian Aditya (Bestman)', initials: 'RA', category: 'Tamu CPP', type: 'Teman', pax: 1, status: 'Konfirmasi Hadir' },
  ]);

  const [demoSeserahan, setDemoSeserahan] = useState([
    { id: 1, box: 'Box 01', name: 'Perlengkapan Ibadah', desc: 'Mukena Sutra Renda, Al-Qur\'an Custom Nama, Sajadah Turki', ready: true, count: '3/3 Item Siap' },
    { id: 2, box: 'Box 02', name: 'Set Perhiasan & Logam Mulia Mahar', desc: 'Kalung Emas 10gr, Anting Berlian, Kotak Kayu Ukir', ready: true, count: '2/2 Item Siap' },
    { id: 3, box: 'Box 03', name: 'Skincare & Parfum Exclusive', desc: 'SK-II Treatment Set, Chanel Coco Mademoiselle 100ml', ready: false, count: '4/5 Item (Proses Hias)' },
    { id: 4, box: 'Box 04', name: 'Sepatu Pesta & Handbag Branded', desc: 'Staccato Heels Silver, Kate Spade Clutch Pesta', ready: true, count: '2/2 Item Siap' },
  ]);

  const toggleDemoTask = (id) => {
    setDemoTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleDemoSeserahan = (id) => {
    setDemoSeserahan(prev => prev.map(item =>
      item.id === id ? { ...item, ready: !item.ready } : item
    ));
  };

  const completedDemoTasks = demoTasks.filter(t => t.completed).length;
  const demoTaskProgress = Math.round((completedDemoTasks / demoTasks.length) * 100);

  const filteredDemoActivities = demoTasks.filter(task => {
    if (demoActivitiesFilter === 'all') return true;
    return task.pic === demoActivitiesFilter;
  });

  const filteredDemoGuests = demoGuests.filter(g => {
    const matchesFilter = demoGuestFilter === 'all' || 
      (demoGuestFilter === 'vip' && g.type === 'VIP') || 
      (demoGuestFilter === 'regular' && g.type !== 'VIP');
    const matchesSearch = !demoGuestSearch || g.name.toLowerCase().includes(demoGuestSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchaseAccess = () => {
    window.open(LYNK_PURCHASE_URL, '_blank', 'noopener,noreferrer');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">

      {/* ================================================================
          HEADER / NAVBAR
          ================================================================ */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <nav className="landing-nav">
          <a href="#" className="landing-brand">
            <img src="/amara-logo.png" alt="Amara" className="landing-logo-img" />
          </a>

          <div className={`landing-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button className="landing-nav-link" onClick={() => scrollToSection('demo')}>
              Demo Companion
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('fitur')}>
              Fitur Amara
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('demo')}>
              Tampilan Amara
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('paket')}>
              Kolaborasi Pasangan
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('kenapa')}>
              Behind Amara
            </button>
          </div>

          <div className="landing-nav-actions">
            <button
              className="btn-nav-login"
              onClick={() => navigate('/login?mode=login')}
            >
              Masuk
            </button>
            <button
              className="btn-nav-cta"
              onClick={handlePurchaseAccess}
            >
              Akses Amara
            </button>
            <button
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ================================================================
          HERO SECTION – Dual smartphone mockup + copy matching team design
          ================================================================ */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Persiapan Nikah Jadi<br />
              <span className="hero-title-highlight">Lebih Mudah</span>
            </h1>

            <p className="hero-subtitle">
              Digital wedding companion yang membantu kamu dan calon
              pasangan mengatur seluruh persiapan pernikahan dalam satu
              platform, mulai dari langkah pertama hingga hari H. Kelola
              anggaran, pembagian tugas, timeline, dan berbagai kebutuhan
              dalam satu platform, dari rencana pertama hingga hari H.
            </p>

            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={handlePurchaseAccess}>
                <span>Mulai Atur Persiapan Nikah</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => scrollToSection('demo')}>
                <span className="btn-play-badge">
                  <Play size={10} fill="#ffffff" stroke="#ffffff" />
                </span>
                <span>Lihat Demo</span>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-phone-wrapper">
              <img
                src="/hero-dual-phone.png"
                alt="Amara Mobile Apps Preview"
                className="hero-phone-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FITUR AMARA – "Setiap Bagian dari Persiapan Pernikahan"
          ================================================================ */}
      <section className="features-section" id="fitur">
        <div className="section-header">
          <span className="section-tag">FITUR AMARA</span>
          <h2 className="section-title">
            Mendampingi Setiap Bagian dari Persiapan Pernikahan
          </h2>
          <p className="section-subtitle">
            Dirancang khusus untuk membantu kamu dan calon pasangan mengelola seluruh tahapan
            persiapan pernikahan secara lebih terstruktur, transparan, dan efisien.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Heart size={20} />
            </div>
            <h3 className="feature-title">Countdown & Persiapan</h3>
            <p className="feature-desc">
              Pantau waktu menuju hari H, lihat persentase kesiapan, dan dapatkan pengingat otomatis untuk agenda yang perlu diselesaikan
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <DollarSign size={20} />
            </div>
            <h3 className="feature-title">Manajemen Anggaran & Biaya</h3>
            <p className="feature-desc">
              Kelola alokasi dana per kategori, catat DP & pelunasan vendor
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="feature-title">Checklist & Pembagian Tugas</h3>
            <p className="feature-desc">
              Susun kebutuhan, bagi tugas, dan tentukan siapa yang bertanggung jawab agar setiap persiapan lebih terarah.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Gift size={20} />
            </div>
            <h3 className="feature-title">Persiapan Seserahan</h3>
            <p className="feature-desc">
              Kelola kebutuhan dan pembelian seserahan agar semua tercatat dan tidak ada yang terlewat
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={20} />
            </div>
            <h3 className="feature-title">Tamu & RSVP</h3>
            <p className="feature-desc">
              Kelola daftar tamu, mulai dari mencatat nama tamu hingga menandai tamu VIP
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Briefcase size={20} />
            </div>
            <h3 className="feature-title">Vendor & Kontak</h3>
            <p className="feature-desc">
              Simpan informasi vendor dan kontak, serta bandingkan vendor berdasarkan kebutuhan dan pilihanmu.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          TAMPILAN AMARA – "Pantau Persiapan Nikah dengan Tampilan
          Praktis dan Interaktif"
          ================================================================ */}
      <section className="preview-section" id="demo">
        <div className="section-header">
          <span className="section-tag">TAMPILAN AMARA</span>
          <h2 className="section-title">
            Pantau Persiapan Nikah dengan Tampilan Praktis dan Interaktif
          </h2>
          <p className="section-subtitle">
            Dirancang khusus untuk membantu kamu dan calon pasangan mengelola seluruh tahapan
            persiapan pernikahan secara lebih terstruktur, transparan, dan efisien.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="preview-tabs">
          {[
            { id: 'overview', icon: <Heart size={15} />, label: 'Overview Dashboard' },
            { id: 'activities', icon: <CheckCircle2 size={15} />, label: 'Checklist & Rundown' },
            { id: 'budget', icon: <DollarSign size={15} />, label: 'Anggaran & Biaya' },
            { id: 'seserahan', icon: <Gift size={15} />, label: 'Seserahan Tracker' },
            { id: 'guests', icon: <Users size={15} />, label: 'Daftar Tamu & RSVP' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`preview-tab-btn ${activePreviewTab === tab.id ? 'active' : ''}`}
              onClick={() => setActivePreviewTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Window Mockup */}
        <div className="preview-window-frame">
          <div className="window-bar">
            <div className="window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="window-address">amarawedding.id/{activePreviewTab}</div>
            <div className="window-actions-dummy">
              <Zap size={15} />
            </div>
          </div>

          <div className="preview-canvas">
            {/* Interactive Experience Banner */}
            <div className="preview-interactive-banner">
              <div className="banner-left">
                <Sparkles size={15} className="sparkle-icon" />
                <span><strong>Simulasi Langsung:</strong> Klik checklist, ubah filter PIC, atau cari nama tamu untuk merasakan UI & UX Amara!</span>
              </div>
              <span className="banner-badge">Interactive Demo</span>
            </div>

            {/* OVERVIEW TAB */}
            {activePreviewTab === 'overview' && (
              <div className="mock-tab-content">
                <div className="mock-header-row">
                  <div className="mock-couple-title">
                    <div className="mock-title-badge-row">
                      <h3>Dhova & Maipa Wedding</h3>
                      <span className="mock-status-pill">Persiapan Aktif</span>
                    </div>
                    <p>Sabtu, 24 Oktober 2026 • Gedung Sasana Kriya, Jakarta</p>
                  </div>
                  <div className="mock-countdown-badge">
                    <Clock size={16} />
                    <span>H - 128 Hari Menuju Akad</span>
                  </div>
                </div>

                <div className="mock-overview-grid">
                  <div className="mock-metric-card">
                    <div className="mock-metric-header">
                      <span className="mock-metric-label">Progress Persiapan</span>
                      <span className="mock-metric-tag">{completedDemoTasks}/{demoTasks.length} Selesai</span>
                    </div>
                    <div className="mock-metric-value">{demoTaskProgress}%</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: `${demoTaskProgress}%` }} />
                    </div>
                    <span className="mock-metric-sub">Tugas pernikahan berjalan sesuai jadwal</span>
                  </div>

                  <div className="mock-metric-card">
                    <div className="mock-metric-header">
                      <span className="mock-metric-label">Dana Pernikahan</span>
                      <span className="mock-metric-tag green">71% Terpakai</span>
                    </div>
                    <div className="mock-metric-value">Rp 85.500.000</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill green" style={{ width: '71%' }} />
                    </div>
                    <span className="mock-metric-sub">Target: Rp 120.000.000 • Sisa: Rp 34.500.000</span>
                  </div>

                  <div className="mock-metric-card">
                    <div className="mock-metric-header">
                      <span className="mock-metric-label">Estimasi Tamu Hadir</span>
                      <span className="mock-metric-tag blue">92% RSVP</span>
                    </div>
                    <div className="mock-metric-value">340 Pax</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill blue" style={{ width: '85%' }} />
                    </div>
                    <span className="mock-metric-sub">Dari 200 Undangan (Keluarga & Teman)</span>
                  </div>
                </div>

                {/* PIC Collaboration Breakdown */}
                <div className="mock-pic-grid">
                  <div className="mock-pic-card">
                    <div className="mock-pic-header">
                      <span className="mock-pic-name">Tugas Dhova (CPP)</span>
                      <span className="mock-pic-pct">80%</span>
                    </div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '80%', background: '#4A1A5D' }} />
                    </div>
                  </div>
                  <div className="mock-pic-card">
                    <div className="mock-pic-header">
                      <span className="mock-pic-name">Tugas Maipa (CPW)</span>
                      <span className="mock-pic-pct">100%</span>
                    </div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '100%', background: '#E11D48' }} />
                    </div>
                  </div>
                  <div className="mock-pic-card">
                    <div className="mock-pic-header">
                      <span className="mock-pic-name">Tugas Bersama</span>
                      <span className="mock-pic-pct">65%</span>
                    </div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '65%', background: '#99182A' }} />
                    </div>
                  </div>
                </div>

                {/* Interactive Checklist Card */}
                <div className="mock-list-container">
                  <div className="mock-list-title">
                    <div className="mock-list-title-left">
                      <span>Panduan Tugas Mendatang (Mendesak)</span>
                      <span className="mock-interactive-hint">✨ Klik checklist untuk coba</span>
                    </div>
                    <span className="mock-link-text">Kelola di Checklist →</span>
                  </div>

                  <div className="mock-tasks-list">
                    {demoTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`mock-task-item ${task.completed ? 'is-done' : ''}`}
                        onClick={() => toggleDemoTask(task.id)}
                      >
                        <div className="mock-task-left">
                          <div className={`mock-item-check ${task.completed ? 'done' : ''}`}>
                            {task.completed && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <div className={`mock-task-title ${task.completed ? 'completed' : ''}`}>
                              {task.title}
                            </div>
                            <div className="mock-task-meta">
                              <span>Tenggat: {task.due}</span>
                              <span>•</span>
                              <span>PIC: <strong>{task.picName}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="mock-task-right">
                          <span className={`mock-tag ${task.pic === 'CPP' ? 'mock-tag-cpp' : task.pic === 'CPW' ? 'mock-tag-cpw' : 'mock-tag-together'}`}>
                            {task.pic}
                          </span>
                          <span className={`mock-tag ${task.priority === 'Mendesak' ? 'mock-tag-urgent' : 'mock-tag-medium'}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITIES TAB */}
            {activePreviewTab === 'activities' && (
              <div className="mock-tab-content">
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800 }}>Alur Kerja & Checklist Tugas Pernikahan</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>Pantau pembagian tanggung jawab antara Dhova (CPP), Maipa (CPW), dan Tugas Bersama.</p>
                  </div>
                  <div className="mock-filter-pills-row">
                    {[
                      { id: 'all', label: `Semua (${demoTasks.length})` },
                      { id: 'CPP', label: 'Tugas Dhova (CPP)' },
                      { id: 'CPW', label: 'Tugas Maipa (CPW)' },
                      { id: 'Bersama', label: 'Tugas Bersama' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        className={`mock-pill-btn ${demoActivitiesFilter === f.id ? 'active' : ''}`}
                        onClick={() => setDemoActivitiesFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mock-phase-card">
                  <div className="mock-phase-header">
                    <span className="mock-phase-badge">Fase 2: H-180 s/d H-90 Hari</span>
                    <span className="mock-phase-title">Persiapan Inti, Busana & Administrasi KUA</span>
                  </div>

                  <div className="mock-tasks-list">
                    {filteredDemoActivities.map(task => (
                      <div 
                        key={task.id} 
                        className={`mock-task-item ${task.completed ? 'is-done' : ''}`}
                        onClick={() => toggleDemoTask(task.id)}
                      >
                        <div className="mock-task-left">
                          <div className={`mock-item-check ${task.completed ? 'done' : ''}`}>
                            {task.completed && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <div className={`mock-task-title ${task.completed ? 'completed' : ''}`}>
                              {task.title}
                            </div>
                            <div className="mock-task-meta">
                              <span>Tenggat: {task.due}</span>
                              <span>•</span>
                              <span>Penanggung Jawab: <strong>{task.picName}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="mock-task-right">
                          <span className={`mock-tag ${task.completed ? 'mock-tag-completed' : 'mock-tag-pending'}`}>
                            {task.completed ? 'Selesai' : 'Pending'}
                          </span>
                          <span className={`mock-tag ${task.pic === 'CPP' ? 'mock-tag-cpp' : task.pic === 'CPW' ? 'mock-tag-cpw' : 'mock-tag-together'}`}>
                            {task.pic}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BUDGET TAB */}
            {activePreviewTab === 'budget' && (
              <div className="mock-tab-content">
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800 }}>Asisten Pengawasan & Alokasi Budget Pernikahan</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>Kelola anggaran pernikahan transparan tanpa ada biaya tak terduga yang terlewat.</p>
                  </div>
                  <div className="mock-deadline-badge">
                    <CalendarCheck size={15} />
                    <span>Target Dana: <strong>H-1 Bulan</strong> (24 Sept 2026)</span>
                  </div>
                </div>

                <div className="mock-budget-kpi-grid">
                  <div className="mock-kpi-card">
                    <span className="mock-kpi-label">Target Anggaran</span>
                    <span className="mock-kpi-value">Rp 120.000.000</span>
                    <span className="mock-kpi-status green">Target Terkumpul 100%</span>
                  </div>
                  <div className="mock-kpi-card">
                    <span className="mock-kpi-label">Total Terkumpul</span>
                    <span className="mock-kpi-value">Rp 120.000.000</span>
                    <span className="mock-kpi-status blue">Tabungan Bersama</span>
                  </div>
                  <div className="mock-kpi-card">
                    <span className="mock-kpi-label">Total Pengeluaran</span>
                    <span className="mock-kpi-value primary">Rp 85.500.000</span>
                    <span className="mock-kpi-status orange">71.25% Terpakai</span>
                  </div>
                  <div className="mock-kpi-card highlight">
                    <span className="mock-kpi-label">Sisa Saldo Aman</span>
                    <span className="mock-kpi-value green">Rp 34.500.000</span>
                    <span className="mock-kpi-status green">Surplus Sisa Dana</span>
                  </div>
                </div>

                <div className="mock-list-container">
                  <div className="mock-list-title">
                    <span>Alokasi Kategori Vendor & Pengeluaran Nyata</span>
                    <span className="mock-link-text">Semua Kategori (8)</span>
                  </div>

                  <div className="mock-budget-category-list">
                    {[
                      { name: 'Catering & Jamuan Makanan (500 Pax)', spent: 'Rp 45.000.000', total: 'Rp 50.000.000', pct: 90, status: 'DP 50% Terbayar', color: '#10B981' },
                      { name: 'Venue & Sewa Gedung Sasana Kriya', spent: 'Rp 25.000.000', total: 'Rp 30.000.000', pct: 83, status: 'DP Terbayar', color: '#3B82F6' },
                      { name: 'MUA, Busana Akad & Resepsi Pengantin', spent: 'Rp 15.500.000', total: 'Rp 15.500.000', pct: 100, status: 'Lunas Penuh ✅', color: '#99182A' },
                      { name: 'Foto & Video Dokumentasi Cinematic', spent: 'Rp 10.000.000', total: 'Rp 12.000.000', pct: 83, status: 'DP 30% Terbayar', color: '#F59E0B' },
                    ].map((cat, idx) => (
                      <div key={idx} className="mock-budget-row">
                        <div className="mock-budget-row-top">
                          <span className="mock-budget-name">{cat.name}</span>
                          <div className="mock-budget-numbers">
                            <strong>{cat.spent}</strong>
                            <span className="mock-budget-max">/ {cat.total}</span>
                            <span className="mock-tag mock-tag-together">{cat.status}</span>
                          </div>
                        </div>
                        <div className="mock-progress-bar-bg">
                          <div className="mock-progress-bar-fill" style={{ width: `${cat.pct}%`, background: cat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SESERAHAN TAB */}
            {activePreviewTab === 'seserahan' && (
              <div className="mock-tab-content">
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800 }}>Pelacak Kelengkapan Kotak Seserahan</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>Pantau status pembelian dan penghiasan setiap kotak seserahan secara transparan.</p>
                  </div>
                  <div className="mock-seserahan-summary-pill">
                    <span>8 Kotak Direncanakan</span>
                    <span>•</span>
                    <strong style={{ color: '#10B981' }}>85% Siap</strong>
                  </div>
                </div>

                <div className="mock-seserahan-grid">
                  {demoSeserahan.map(box => (
                    <div 
                      key={box.id} 
                      className={`mock-seserahan-card ${box.ready ? 'ready' : 'in-progress'}`}
                      onClick={() => toggleDemoSeserahan(box.id)}
                    >
                      <div className="mock-seserahan-card-top">
                        <span className="mock-box-label">{box.box}</span>
                        <span className={`mock-tag ${box.ready ? 'mock-tag-completed' : 'mock-tag-pending'}`}>
                          {box.ready ? 'Siap (100%)' : 'Proses Hias'}
                        </span>
                      </div>
                      <div className="mock-seserahan-title">{box.name}</div>
                      <div className="mock-seserahan-desc">{box.desc}</div>
                      <div className="mock-seserahan-footer">
                        <span className="mock-seserahan-count">{box.count}</span>
                        <span className="mock-seserahan-toggle-hint">Klik untuk ubah</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GUESTS TAB */}
            {activePreviewTab === 'guests' && (
              <div className="mock-tab-content">
                {/* 5 Stats Cards (matching Amara GuestList) */}
                <div className="mock-guest-stats-grid">
                  <div className="mock-guest-stat-card">
                    <span className="mock-gstat-label">Tamu Reguler</span>
                    <span className="mock-gstat-val">180</span>
                  </div>
                  <div className="mock-guest-stat-card">
                    <span className="mock-gstat-label">Tamu VIP</span>
                    <span className="mock-gstat-val">45</span>
                  </div>
                  <div className="mock-guest-stat-card">
                    <span className="mock-gstat-label">Tamu CPW (Maipa)</span>
                    <span className="mock-gstat-val">160</span>
                  </div>
                  <div className="mock-guest-stat-card">
                    <span className="mock-gstat-label">Tamu CPP (Dhova)</span>
                    <span className="mock-gstat-val">180</span>
                  </div>
                  <div className="mock-guest-stat-card highlight">
                    <span className="mock-gstat-label">Total Hadir</span>
                    <span className="mock-gstat-val">340 Pax</span>
                  </div>
                </div>

                {/* Toolbar: Filter Pills on Left, Search on Right */}
                <div className="mock-guest-toolbar">
                  <div className="mock-gtoolbar-left">
                    <button 
                      type="button" 
                      className={`mock-pill-btn ${demoGuestFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setDemoGuestFilter('all')}
                    >
                      Semua Tamu (5)
                    </button>
                    <button 
                      type="button" 
                      className={`mock-pill-btn ${demoGuestFilter === 'regular' ? 'active' : ''}`}
                      onClick={() => setDemoGuestFilter('regular')}
                    >
                      Reguler (3)
                    </button>
                    <button 
                      type="button" 
                      className={`mock-pill-btn ${demoGuestFilter === 'vip' ? 'active' : ''}`}
                      onClick={() => setDemoGuestFilter('vip')}
                    >
                      VIP (2)
                    </button>
                  </div>
                  <div className="mock-guest-search">
                    <Search size={14} className="mock-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Cari tamu..." 
                      className="mock-search-input" 
                      value={demoGuestSearch}
                      onChange={e => setDemoGuestSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="mock-table-container">
                  <table className="mock-guest-table">
                    <thead>
                      <tr>
                        <th>NAMA TAMU / KELUARGA</th>
                        <th>KATEGORI</th>
                        <th>TIPE TAMU</th>
                        <th>PAX</th>
                        <th>STATUS RSVP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDemoGuests.length > 0 ? (
                        filteredDemoGuests.map(g => (
                          <tr key={g.id}>
                            <td>
                              <div className="mock-guest-user">
                                <div className="mock-avatar">{g.initials}</div>
                                <span className="mock-guest-name">{g.name}</span>
                              </div>
                            </td>
                            <td><span className="mock-category-text">{g.category}</span></td>
                            <td>
                              <span className={`mock-tag ${g.type === 'VIP' ? 'mock-tag-urgent' : 'mock-tag-together'}`}>
                                {g.type}
                              </span>
                            </td>
                            <td><strong>{g.pax} Pax</strong></td>
                            <td>
                              <span className={`mock-tag ${g.status === 'Konfirmasi Hadir' ? 'mock-tag-completed' : 'mock-tag-medium'}`}>
                                {g.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                            Tidak ada tamu yang cocok dengan pencarian
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          PRICING – "Satu Paket Amara untuk Kamu dan Calon Pasangan"
          ================================================================ */}
      <section className="pricing-section" id="paket">
        <div className="section-header">
          <span className="section-tag section-tag-clean">KOLABORASI BERSAMA CALON PASANGAN</span>
          <h2 className="section-title">
            Satu Paket Amara untuk Kamu dan Calon Pasangan
          </h2>
          <p className="section-subtitle">
            Mempermudah kolaborasi dengan calon pasangan dalam mengatur, berbagi tugas, dan mempersiapkan setiap detail
            menuju hari H bersama, dengan akses penuh ke seluruh Amara tanpa langganan bulanan
          </p>
        </div>

        <div className="pricing-split-layout">
          {/* Left: Devices Mockup (MacBook + iPhone) */}
          <div className="pricing-visual">
            <img
              src="/devices-mockup.png"
              alt="Amara di Laptop dan Smartphone"
              className="pricing-devices-img"
            />
          </div>

          {/* Right: Pricing Card */}
          <div className="pricing-card-new">
            <div className="pricing-card-header">
              <div className="pricing-card-badge">ALL IN ONE PASS</div>
              <div className="pricing-original-price">Rp499.000</div>
              <div className="pricing-current-price">Rp105.000,-</div>
              <div className="pricing-subtext-pill">Sekali bayar • Akses selamanya • 2 Akun</div>
            </div>

            <div className="pricing-card-body">
              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>2 Akun untuk Persiapan yang Terhubung Real-Time</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>Sekali Bayar untuk Akses Selamanya</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>Siap Diakses dari Laptop maupun Smartphone</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>Nikmati Akses Penuh ke Seluruh Fitur Amara</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>Kelola Tamu & Biaya Tanpa Batas</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-check-icon"><Check size={13} strokeWidth={3} /></div>
                  <span>Dapatkan Setiap Update Fitur Tanpa Biaya Tambahan</span>
                </div>
              </div>

              <button className="btn-pricing-cta" onClick={handlePurchaseAccess}>
                <span>Mulai Bagi Tugas Bersama →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          ABOUT / MISSION – "Behind Amara"
          ================================================================ */}
      <section className="mission-section" id="kenapa">
        <div className="mission-inner">
          {/* Left Column: Photo Frame */}
          <div className="mission-visual">
            <div className="mission-photo-frame">
              <img
                src="/founders-photo.jpg"
                alt="Dhova & Maipa - Founders Amara"
                className="mission-photo"
              />
            </div>
          </div>

          {/* Right Column: Behind Amara Content */}
          <div className="mission-content">
            <span className="mission-tag-header">BEHIND AMARA</span>
            <h2 className="mission-title">
              Berawal dari Misi Melawan Isu<br />
              <span className="mission-title-highlight">'Marriage is Scary'</span>
            </h2>

            <p className="mission-text mission-greeting">
              Halo <strong>Dhova & Maipa</strong> di sini
            </p>

            <p className="mission-text">
              Kami adalah pasangan suami istri yang aktif berbagi konten tentang pernikahan
              lewat media sosial. Melalui konten-konten kami, kami harap bisa memotivasi
              generasi muda agar memandang pernikahan bukan jadi sesuatu yang menakutkan,
              melainkan sesuatu yang layak diimpikan dan direncanakan dengan matang.
            </p>

            <p className="mission-text">
              Kami paham, yang namanya pernikahan pasti akan selalu ada tantangan yang
              membuat kita ragu baik dari perencanaan hingga realitas saat menjalani rumah
              tangga. Namun kami yakin dengan niat dan ilmu yang tepat, pernikahan justru bisa
              jadi momen terbaik dalam kehidupan kita.
            </p>

            {/* Featured Quote Box */}
            <div className="mission-quote-card">
              <div className="quote-card-left">
                <img
                  src="/amara-heart-symbol.png"
                  alt="Amara Logo"
                  className="quote-card-amara-logo"
                />
              </div>
              <div className="quote-card-divider" />
              <div className="quote-card-right">
                <h4 className="quote-card-title">Dari cerita dan pengalaman itu, lahirlah Amara.</h4>
                <p className="quote-card-body">
                  Sebuah platform yang membuat pengalaman mengatur acara pernikahan yang awalnya
                  ribet dan memusingkan, menjadi lebih mudah dan menyenangkan. Kamu dan calon
                  pasanganmu bisa mengatur anggaran, membagi tugas, mencatat tamu, sampai memantau
                  vendor di satu tempat, lebih terukur dan tanpa saling menebak-nebak.
                </p>
              </div>
            </div>

            <p className="mission-text">
              Menikah memang butuh persiapan, tapi persiapan itu tidak harus menakutkan. Kami ingin
              kamu menikmati setiap langkah prosesnya.
            </p>

            <p className="mission-text mission-bold">
              Jadi, selamat mencoba Amara, dan selamat menyiapkan hari bahagiamu!
            </p>

            <div className="mission-cta-wrapper">
              <button className="btn-mission-cta-pill" onClick={handlePurchaseAccess}>
                Coba Amara Sekarang!
              </button>
            </div>

            <div className="mission-social-container">
              <span className="mission-social-label">Ikuti perjalanan kami di Social Media:</span>
              <div className="mission-social-list">
                <div className="social-creator-card">
                  <span className="creator-name">Rumah Ramai</span>
                  <div className="creator-links">
                    <a
                      href="https://www.tiktok.com/@rumah.ramai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="TikTok @rumah.ramai"
                      aria-label="TikTok Rumah Ramai"
                    >
                      <TikTokIcon size={14} />
                    </a>
                    <a
                      href="https://www.instagram.com/rumah.ramaii"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="Instagram @rumah.ramaii"
                      aria-label="Instagram Rumah Ramai"
                    >
                      <InstagramIcon size={14} />
                    </a>
                  </div>
                </div>

                <div className="social-creator-card">
                  <span className="creator-name">Maipadee</span>
                  <div className="creator-links">
                    <a
                      href="https://www.tiktok.com/@maipadee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="TikTok @maipadee"
                      aria-label="TikTok Maipadee"
                    >
                      <TikTokIcon size={14} />
                    </a>
                    <a
                      href="https://www.instagram.com/maipadee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="Instagram @maipadee"
                      aria-label="Instagram Maipadee"
                    >
                      <InstagramIcon size={14} />
                    </a>
                  </div>
                </div>

                <div className="social-creator-card">
                  <span className="creator-name">Ramdhov</span>
                  <div className="creator-links">
                    <a
                      href="https://www.tiktok.com/@ramdhov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="TikTok @ramdhov"
                      aria-label="TikTok Ramdhov"
                    >
                      <TikTokIcon size={14} />
                    </a>
                    <a
                      href="https://www.instagram.com/ramdhov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon-btn"
                      title="Instagram @ramdhov"
                      aria-label="Instagram Ramdhov"
                    >
                      <InstagramIcon size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/amara-logo.png" alt="Amara Wedding Companion" className="landing-logo-img" style={{ height: 32 }} />
            <span className="footer-text">© {new Date().getFullYear()} Amara Digital Wedding Companion. All Rights Reserved.</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="landing-nav-link" onClick={() => navigate('/login?mode=login')}>Masuk</button>
            <button className="landing-nav-link" onClick={handlePurchaseAccess}>Akses Amara</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
