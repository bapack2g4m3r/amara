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
  Home,
  CheckSquare,
  Lock,
  PhoneCall,
  AlertCircle,
  UserPlus,
  Settings,
  Shield,
  LogOut,
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

  // Interactive demo states for realistic Amara app experience (Dhova & Maipa Wedding)
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Booking Gedung Sasana Kriya TMII (Akad & Resepsi)', category: 'Venue', pic: 'CPP', picName: 'Dhova', due: '15 Mei 2026', priority: 'Mendesak', completed: true },
    { id: 2, title: 'Fitting Kebaya Pengantin & Beskap Akad (Marlene Hariman)', category: 'Attire & MUA', pic: 'CPW', picName: 'Maipa', due: '20 Juni 2026', priority: 'Tinggi', completed: true },
    { id: 3, title: 'DP Katering & Food Tasting 500 Pax (Diamond Catering)', category: 'Catering', pic: 'Bersama', picName: 'Dhova & Maipa', due: '10 Juli 2026', priority: 'Mendesak', completed: true },
    { id: 4, title: 'Pendaftaran Berkas Nikah & Kursus Pra-Nikah KUA', category: 'Administrasi', pic: 'CPP', picName: 'Dhova', due: '10 Ags 2026', priority: 'Mendesak', completed: false },
    { id: 5, title: 'Pilih Desain & Cetak Undangan Hardcover (200 Pcs)', category: 'Undangan', pic: 'CPW', picName: 'Maipa', due: '25 Ags 2026', priority: 'Tinggi', completed: false },
    { id: 6, title: 'Technical Meeting Vendor & Rundown bersama WO', category: 'Wedding Organizer', pic: 'Bersama', picName: 'Dhova & Maipa', due: '15 Sept 2026', priority: 'Mendesak', completed: false },
  ]);

  const [demoActivitiesFilter, setDemoActivitiesFilter] = useState('all');
  const [demoGuestFilter, setDemoGuestFilter] = useState('all');
  const [demoGuestSearch, setDemoGuestSearch] = useState('');

  // Authentic Overview State (Dhova & Maipa Wedding)
  const [overviewPendingTasks, setOverviewPendingTasks] = useState([
    {
      id: 'ov-1',
      title: 'First family meeting',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
    {
      id: 'ov-2',
      title: 'Datang ke wedding exhibition',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#10B981',
      completed: false
    },
  ]);

  const toggleOverviewPendingTask = (id) => {
    setOverviewPendingTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const bersamaDone = 4 + overviewPendingTasks.filter(t => t.completed).length;
  const bersamaTotal = 6;
  const bersamaPct = Math.round((bersamaDone / bersamaTotal) * 100);

  const totalAll = 1 + 2 + bersamaTotal; // 9
  const completedAll = 1 + 2 + bersamaDone;
  const overallPct = Math.round((completedAll / totalAll) * 100);
  const remainingAll = totalAll - completedAll;

  // Realistic Budget Allocation items for Dhova & Maipa
  const [demoBudgetCategories] = useState([
    { id: 1, item: 'Sewa Gedung Sasana Kriya TMII (Full Day)', vendor: 'Sasana Kriya Management', actual: 'Rp 28.000.000', paid: 'Rp 20.000.000', sisa: 'Rp 8.000.000', status: 'Cicilan', deadline: '24 Ags 2026' },
    { id: 2, item: 'Paket Buffet & Food Stall 500 Pax', vendor: 'Diamond Catering Services', actual: 'Rp 45.000.000', paid: 'Rp 25.000.000', sisa: 'Rp 20.000.000', status: 'Cicilan', deadline: '10 Sept 2026' },
    { id: 3, item: 'MUA Marlene Hariman & Sewa Kebaya', vendor: 'Rumah Kebaya & Marlene MUA', actual: 'Rp 15.500.000', paid: 'Rp 15.500.000', sisa: 'Rp 0', status: 'Lunas', deadline: 'Lunas ✅' },
    { id: 4, item: 'Cinematic Video & Foto Dokumentasi', vendor: 'Calia Photography Jakarta', actual: 'Rp 10.000.000', paid: 'Rp 5.000.000', sisa: 'Rp 5.000.000', status: 'Cicilan', deadline: '01 Okt 2026' },
    { id: 5, item: 'Dekorasi Pelaminan Rustic Rose Garden', vendor: 'Rose Petal Décor', actual: 'Rp 14.000.000', paid: 'Rp 7.000.000', sisa: 'Rp 7.000.000', status: 'Cicilan', deadline: '15 Sept 2026' },
    { id: 6, item: 'Undangan Hardcover & Souvenir Aromaterapi', vendor: 'Paperie Studio & Artisan', actual: 'Rp 4.500.000', paid: 'Rp 2.500.000', sisa: 'Rp 2.000.000', status: 'Cicilan', deadline: '25 Ags 2026' },
  ]);

  // Realistic Vendors for Dhova & Maipa
  const [demoVendors] = useState([
    { id: 1, name: 'Gedung Sasana Kriya TMII', category: 'Venue & Gedung', contact: '0812-9876-2341 (Pak Bambang)', status: 'DP Terbayar', cost: 'Rp 28.000.000', paid: 'Rp 20.000.000' },
    { id: 2, name: 'Diamond Catering Services', category: 'Katering 500 Pax', contact: '0813-1122-3344 (Ibu Lisa)', status: 'DP Terbayar', cost: 'Rp 45.000.000', paid: 'Rp 25.000.000' },
    { id: 3, name: 'Marlene Hariman & Rumah Kebaya', category: 'MUA & Busana Pengantin', contact: '0811-3344-5566 (Marlene Studio)', status: 'Lunas Penuh ✅', cost: 'Rp 15.500.000', paid: 'Rp 15.500.000' },
    { id: 4, name: 'Calia Photography Jakarta', category: 'Dokumentasi Cinematic', contact: '0818-7788-9900 (Aldi)', status: 'DP Terbayar', cost: 'Rp 10.000.000', paid: 'Rp 5.000.000' },
  ]);

  // Realistic Guest List for Dhova & Maipa
  const [demoGuests] = useState([
    { id: 1, name: 'Bpk. H. Rahmat & Keluarga', initials: 'HR', category: 'Keluarga CPP (Dhova)', type: 'VIP', pax: 4, status: 'Konfirmasi Hadir' },
    { id: 2, name: 'dr. Sarah Melinda & Suami', initials: 'SM', category: 'Teman Kuliah (Maipa)', type: 'VIP', pax: 2, status: 'Konfirmasi Hadir' },
    { id: 3, name: 'Keluarga Besar Alm. H. Mansyur', initials: 'HM', category: 'Keluarga CPW (Maipa)', type: 'Reguler', pax: 6, status: 'Konfirmasi Hadir' },
    { id: 4, name: 'Tim Product & Tech PT Inovasi', initials: 'TI', category: 'Rekan Kantor (Dhova)', type: 'Reguler', pax: 10, status: 'Konfirmasi Hadir' },
    { id: 5, name: 'Dini Septiani & Partner', initials: 'DS', category: 'Sahabat SMA (Maipa)', type: 'Reguler', pax: 2, status: 'Menunggu RSVP' },
    { id: 6, name: 'Rian Aditya (Bestman)', initials: 'RA', category: 'Sahabat (Dhova)', type: 'VIP', pax: 1, status: 'Konfirmasi Hadir' },
  ]);

  // Realistic Seserahan items for Dhova & Maipa
  const [demoSeserahan, setDemoSeserahan] = useState([
    { id: 1, box: 'Kotak 01', name: 'Logam Mulia Antam 10gr & Cincin Kawin', desc: 'Emas Antam CertiEye, Cincin Platina Ukir Nama Dhova & Maipa', ready: true, count: '2/2 Item Siap', price: 'Rp 16.500.000' },
    { id: 2, box: 'Kotak 02', name: 'Perlengkapan Ibadah Exclusive', desc: 'Mukena Sutra Paris Renda Handmade, Al-Qur\'an Mushaf Madinah, Sajadah Turki', ready: true, count: '3/3 Item Siap', price: 'Rp 2.800.000' },
    { id: 3, box: 'Kotak 03', name: 'Skincare & Parfum Exclusive', desc: 'SK-II Facial Treatment Essence, Chanel Coco Mademoiselle EDP 100ml', ready: false, count: '4/5 Item (Proses Hias)', price: 'Rp 6.200.000' },
    { id: 4, box: 'Kotak 04', name: 'Sepatu Hak Tinggi & Tas Pesta', desc: 'Staccato Crystal Pumps Silver, Kate Spade Grace Leather Bag', ready: true, count: '2/2 Item Siap', price: 'Rp 4.750.000' },
    { id: 5, box: 'Kotak 05', name: 'Kain Tradisional & Bahan Busana', desc: 'Songket Palembang Benang Emas Asli, Bahan Brokat Prancis Premium', ready: true, count: '2/2 Item Siap', price: 'Rp 5.500.000' },
    { id: 6, box: 'Kotak 06', name: 'Body Care & Nightwear Set', desc: 'L\'Occitane Almond Shower Oil Set, Silk Satin Robe & Piyama Sleepwear', ready: false, count: '3/4 Item (Proses Hias)', price: 'Rp 2.900.000' },
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
              <div className="hero-real-mobile-phone">
                <div className="phone-speaker-notch"></div>
                <div className="phone-screen">
                  {/* Mobile Status Bar */}
                  <div className="phone-status-bar">
                    <span>09:41</span>
                    <div className="phone-status-icons">
                      <span className="phone-status-dot"></span>
                      <span className="phone-status-battery"></span>
                    </div>
                  </div>

                  {/* Mobile App Header */}
                  <div className="phone-app-header">
                    <img src="/amara-logo.png" alt="Amara" className="phone-logo" />
                    <div className="phone-couple-badge">
                      <span className="phone-avatar-dot">DM</span>
                      <span className="phone-couple-title">Dhova & Maipa</span>
                    </div>
                  </div>

                  {/* Mobile Countdown Card */}
                  <div className="phone-countdown-card">
                    <span className="phone-card-tag">COUNTDOWN HARI H</span>
                    <div className="phone-countdown-val">128 Hari</div>
                    <span className="phone-countdown-sub">Sabtu, 24 Okt 2026 • Sasana Kriya TMII</span>
                  </div>

                  {/* Mobile Progress Card */}
                  <div className="phone-progress-card">
                    <div className="phone-progress-top">
                      <span>Progres Persiapan</span>
                      <strong className="phone-progress-pct">{demoTaskProgress}%</strong>
                    </div>
                    <div className="phone-progress-bar-bg">
                      <div className="phone-progress-bar-fill" style={{ width: `${demoTaskProgress}%` }}></div>
                    </div>
                    <div className="phone-partner-bars">
                      <div className="partner-bar-row">
                        <span className="partner-label">Tugas Dhova (CPP)</span>
                        <span className="partner-pct">80% Selesai</span>
                      </div>
                      <div className="partner-bar-row">
                        <span className="partner-label">Tugas Maipa (CPW)</span>
                        <span className="partner-pct">100% Selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Mini Budget Snapshot */}
                  <div className="phone-mini-budget">
                    <div className="phone-budget-row">
                      <span className="pbudget-label">Pengeluaran Terpakai</span>
                      <span className="pbudget-tag">On Track</span>
                    </div>
                    <div className="pbudget-val">
                      Rp 85.500.000 <span className="pbudget-max">/ 120jt</span>
                    </div>
                  </div>

                  {/* Mobile Bottom Navigation Bar */}
                  <div className="phone-bottom-nav">
                    <div className="phone-nav-item active"><Home size={14} /><span>Home</span></div>
                    <div className="phone-nav-item"><CheckSquare size={14} /><span>Checklist</span></div>
                    <div className="phone-nav-item"><DollarSign size={14} /><span>Anggaran</span></div>
                    <div className="phone-nav-item"><Gift size={14} /><span>Seserahan</span></div>
                    <div className="phone-nav-item"><Users size={14} /><span>Tamu</span></div>
                  </div>
                </div>
              </div>

              {/* Floating Trust Badge */}
              <div className="hero-floating-badge">
                <div className="floating-badge-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong>Antarmuka Asli Amara</strong>
                  <p>100% Nyata Sesuai Aplikasi</p>
                </div>
              </div>
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
            { id: 'overview', icon: <Home size={15} />, label: 'Beranda' },
            { id: 'activities', icon: <CheckSquare size={15} />, label: 'Aktivitas' },
            { id: 'budget', icon: <DollarSign size={15} />, label: 'Anggaran' },
            { id: 'seserahan', icon: <Gift size={15} />, label: 'Seserahan' },
            { id: 'vendor', icon: <Users size={15} />, label: 'Vendor' },
            { id: 'guests', icon: <UserPlus size={15} />, label: 'Tamu' },
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

        {/* Real Amara Desktop Application Window Frame */}
        <div className="preview-window-frame">
          <div className="window-bar">
            <div className="window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="window-address">
              <Lock size={11} className="window-lock-icon" />
              <span>amarawedding.id/{activePreviewTab === 'overview' ? 'overview' : activePreviewTab === 'activities' ? 'activities' : activePreviewTab === 'budget' ? 'budget' : activePreviewTab === 'seserahan' ? 'seserahan' : activePreviewTab === 'guests' ? 'guest-list' : activePreviewTab === 'vendor' ? 'vendor' : activePreviewTab}</span>
            </div>
            <div className="window-actions-dummy">
              <span className="window-real-badge">
                <span className="real-indicator-dot"></span>
                <span>Antarmuka Asli Amara • Dhova & Maipa</span>
              </span>
            </div>
          </div>

          <div className="preview-desktop-body">
            {/* Real Amara Desktop Sidebar Navigation (100% Asli) */}
            <aside className="preview-real-sidebar">
              <img src="/amara-logo.png" alt="Amara Logo" className="preview-sidebar-logo" />

              <ul className="preview-sidebar-nav-list">
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('overview')}
                  >
                    <Home size={18} />
                    <span>Beranda</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'activities' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('activities')}
                  >
                    <CheckSquare size={18} />
                    <span>Aktivitas</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className="preview-sidebar-link"
                    onClick={() => setActivePreviewTab('activities')}
                  >
                    <Calendar size={18} />
                    <span>Jadwal</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'budget' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('budget')}
                  >
                    <DollarSign size={18} />
                    <span>Anggaran</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'seserahan' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('seserahan')}
                  >
                    <Gift size={18} />
                    <span>Seserahan</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'vendor' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('vendor')}
                  >
                    <Users size={18} />
                    <span>Vendor</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'guests' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('guests')}
                  >
                    <UserPlus size={18} />
                    <span>Tamu</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className="preview-sidebar-link"
                    onClick={() => {}}
                  >
                    <Settings size={18} />
                    <span>Pengaturan</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className="preview-sidebar-link"
                    onClick={() => {}}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </button>
                </li>
              </ul>

              <div className="preview-sidebar-footer">
                <button type="button" className="preview-btn-logout">
                  <LogOut size={18} />
                  <span>Keluar</span>
                </button>
              </div>
            </aside>

            {/* Real Amara Main Content Workspace */}
            <div className="preview-canvas">
              {/* Interactive Experience Banner */}
              <div className="preview-interactive-banner">
                <div className="banner-left">
                  <Sparkles size={15} className="sparkle-icon" />
                  <span><strong>100% Antarmuka Asli Amara:</strong> Klik tugas tertunda di bawah atau jelajahi menu untuk merasakan langsung antarmuka Amara!</span>
                </div>
                <span className="banner-badge">Interactive Live App</span>
              </div>

              {/* OVERVIEW (BERANDA) TAB - 100% MATCHING SCREENSHOT */}
              {activePreviewTab === 'overview' && (
                <div className="mock-tab-content preview-overview-content">
                  <header className="preview-overview-header">
                    <h1 className="preview-overview-title">Halo, Dhova & Maipa</h1>
                    <p className="preview-overview-subtitle">Berikut adalah ringkasan persiapan pernikahan Anda hari ini.</p>
                  </header>

                  <div className="preview-dashboard-grid">
                    {/* Left Column: Countdown & Progress */}
                    <div className="preview-grid-left">
                      {/* Countdown Card */}
                      <div className="card countdown-card preview-countdown-card">
                        <div className="countdown-content">
                          <h2>72 Hari</h2>
                          <p>menuju hari bahagia Anda.</p>
                          <div className="countdown-timer preview-countdown-timer">
                            <div className="time-box preview-time-box">
                              <span className="time-value">02</span>
                              <span className="time-label">BULAN</span>
                            </div>
                            <div className="time-box preview-time-box">
                              <span className="time-value">01</span>
                              <span className="time-label">MINGGU</span>
                            </div>
                            <div className="time-box preview-time-box">
                              <span className="time-value">05</span>
                              <span className="time-label">HARI</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Card */}
                      <div className="card progress-card preview-progress-card">
                        <div className="priority-header" style={{ width: '100%', marginBottom: '16px' }}>
                          <h3 style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>Progres Keseluruhan</h3>
                          <span 
                            className="btn-text" 
                            style={{ color: '#99182A', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                            onClick={() => setActivePreviewTab('activities')}
                          >
                            Lihat Semua
                          </span>
                        </div>

                        <div className="progress-circle preview-progress-circle" style={{ '--progress': `${overallPct}%` }}>
                          <div className="progress-circle-inner preview-progress-circle-inner">
                            <span className="progress-percentage preview-progress-percentage">{overallPct}%</span>
                            <span className={`progress-status-badge ${remainingAll === 0 ? 'completed' : 'active'}`}>
                              {remainingAll === 0 ? 'Semua selesai' : `${remainingAll} tersisa`}
                            </span>
                          </div>
                        </div>

                        {/* PIC Collaboration Breakdown */}
                        <div className="pic-breakdown-container preview-pic-breakdown-container">
                          <div className="pic-breakdown-title">
                            <span>PROGRES KOLABORASI PASANGAN</span>
                          </div>
                          <div className="pic-breakdown-grid preview-pic-breakdown-grid">
                            <div className="pic-breakdown-item pic-cpp preview-pic-item">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><User size={13} /></span> Tugas Dhova
                                </span>
                                <span className="pic-breakdown-pct" style={{ color: '#2563eb' }}>100%</span>
                              </div>
                              <div className="pic-breakdown-bar">
                                <div className="pic-breakdown-bar-fill" style={{ width: '100%', background: '#2563eb' }} />
                              </div>
                              <div className="pic-breakdown-sub">
                                1 / 1 selesai
                              </div>
                            </div>

                            <div className="pic-breakdown-item pic-cpw preview-pic-item">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><User size={13} /></span> Tugas Maipa
                                </span>
                                <span className="pic-breakdown-pct" style={{ color: '#db2777' }}>100%</span>
                              </div>
                              <div className="pic-breakdown-bar">
                                <div className="pic-breakdown-bar-fill" style={{ width: '100%', background: '#db2777' }} />
                              </div>
                              <div className="pic-breakdown-sub">
                                2 / 2 selesai
                              </div>
                            </div>

                            <div className="pic-breakdown-item pic-bersama preview-pic-item">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><Users size={13} /></span> Tugas Bersama
                                </span>
                                <span className="pic-breakdown-pct" style={{ color: '#99182A' }}>{bersamaPct}%</span>
                              </div>
                              <div className="pic-breakdown-bar">
                                <div className="pic-breakdown-bar-fill" style={{ width: `${bersamaPct}%`, background: '#99182A' }} />
                              </div>
                              <div className="pic-breakdown-sub">
                                {bersamaDone} / {bersamaTotal} selesai
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Priority Card (Tugas Tertunda) */}
                    <div className="card priority-card preview-priority-card">
                      <div className="priority-header">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tugas Tertunda</h3>
                        <span 
                          className="btn-text" 
                          style={{ color: '#99182A', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                          onClick={() => setActivePreviewTab('activities')}
                        >
                          Lihat Semua
                        </span>
                      </div>
                      <ul className="task-list preview-task-list">
                        {overviewPendingTasks.map((task) => (
                          <li 
                            key={task.id} 
                            className={`task-item preview-task-item ${task.completed ? 'is-completed' : ''}`}
                            style={{ borderLeftColor: task.color, borderLeftWidth: '5px' }}
                            onClick={() => toggleOverviewPendingTask(task.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                              <button 
                                type="button" 
                                className={`btn-check small ${task.completed ? 'checked' : ''}`}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '5px',
                                  border: task.completed ? 'none' : '2px solid #CBD5E1',
                                  background: task.completed ? '#10B981' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                {task.completed && <Check size={13} color="white" strokeWidth={3} />}
                              </button>
                              <div className="task-info" style={{ minWidth: 0, flex: 1 }}>
                                <h4 style={{ 
                                  fontSize: '0.95rem', 
                                  fontWeight: 600, 
                                  margin: 0, 
                                  marginBottom: '4px',
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                                  fontFamily: 'var(--font-title)'
                                }}>
                                  {task.title}
                                </h4>
                                <div className="task-meta-row">
                                  <span className="task-category-tag">{task.category}</span>
                                  <span className="task-pic-badge pic-bersama" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                    {task.picName}
                                  </span>
                                  <span className="task-date-tag none">Tanpa batas waktu</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
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
                      <span>Status Dana: <strong>Aman (On Track)</strong></span>
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

                  <div className="mock-table-container">
                    <table className="mock-guest-table">
                      <thead>
                        <tr>
                          <th>KEBUTUHAN / ITEM</th>
                          <th>VENDOR</th>
                          <th>AKTUAL</th>
                          <th>TERBAYAR</th>
                          <th>SISA</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoBudgetCategories.map(b => (
                          <tr key={b.id}>
                            <td>
                              <strong style={{ color: 'var(--color-text)' }}>{b.item}</strong>
                            </td>
                            <td><span className="mock-category-text">{b.vendor}</span></td>
                            <td><span style={{ fontWeight: 600 }}>{b.actual}</span></td>
                            <td><span style={{ color: '#059669', fontWeight: 600 }}>{b.paid}</span></td>
                            <td><span style={{ color: b.sisa === 'Rp 0' ? '#94A3B8' : '#D97706', fontWeight: 600 }}>{b.sisa}</span></td>
                            <td>
                              <span className={`mock-tag ${b.status === 'Lunas' ? 'mock-tag-completed' : 'mock-tag-together'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{box.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GUESTS TAB */}
              {activePreviewTab === 'guests' && (
                <div className="mock-tab-content">
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

                  <div className="mock-guest-toolbar">
                    <div className="mock-gtoolbar-left">
                      <button 
                        type="button" 
                        className={`mock-pill-btn ${demoGuestFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDemoGuestFilter('all')}
                      >
                        Semua Tamu ({demoGuests.length})
                      </button>
                      <button 
                        type="button" 
                        className={`mock-pill-btn ${demoGuestFilter === 'regular' ? 'active' : ''}`}
                        onClick={() => setDemoGuestFilter('regular')}
                      >
                        Reguler
                      </button>
                      <button 
                        type="button" 
                        className={`mock-pill-btn ${demoGuestFilter === 'vip' ? 'active' : ''}`}
                        onClick={() => setDemoGuestFilter('vip')}
                      >
                        VIP
                      </button>
                    </div>
                    <div className="mock-guest-search">
                      <Search size={14} className="mock-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Cari nama tamu..." 
                        className="mock-search-input" 
                        value={demoGuestSearch}
                        onChange={e => setDemoGuestSearch(e.target.value)}
                      />
                    </div>
                  </div>

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

              {/* VENDOR TAB */}
              {activePreviewTab === 'vendor' && (
                <div className="mock-tab-content">
                  <div className="mock-header-row">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 800 }}>Manajemen Vendor & Pembayaran</h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>Pantau kontak PIC, total kontrak kerja, dan progress DP pelunasan vendor pernikahan.</p>
                    </div>
                    <div className="mock-deadline-badge">
                      <Check size={14} />
                      <span>4 Vendor Terkonfirmasi</span>
                    </div>
                  </div>

                  <div className="mock-vendor-grid">
                    {demoVendors.map(v => (
                      <div key={v.id} className="mock-vendor-card">
                        <div className="mock-vendor-card-header">
                          <span className="mock-vendor-category">{v.category}</span>
                          <span className={`mock-tag ${v.status.includes('Lunas') ? 'mock-tag-completed' : 'mock-tag-together'}`}>
                            {v.status}
                          </span>
                        </div>
                        <h4 className="mock-vendor-name">{v.name}</h4>
                        <div className="mock-vendor-contact">
                          <PhoneCall size={13} />
                          <span>{v.contact}</span>
                        </div>
                        <div className="mock-vendor-footer">
                          <div className="mock-vendor-cost">
                            <span className="cost-label">Total Kontrak:</span>
                            <strong className="cost-val">{v.cost}</strong>
                          </div>
                          <div className="mock-vendor-paid">
                            <span className="paid-label">Terbayar:</span>
                            <strong className="paid-val">{v.paid}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
