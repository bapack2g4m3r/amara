import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  DollarSign,
  Gift,
  Users,
  CheckCircle2,
  CheckCircle,
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
  BarChart2,
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
  Star,
  MessageCircle,
  ExternalLink,
  Edit2,
  Edit3,
  Trash2,
  Copy,
  Crown,
  Upload,
  ShoppingBag,
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

  // =========================================================================
  // AUTHENTIC AMARA INTERACTIVE DEMO STATES (DHOVA & MAIPA WEDDING)
  // =========================================================================
  const groomName = "Dhova";
  const brideName = "Maipa";
  const coupleTitle = "Pernikahan Dhova & Maipa";
  const weddingDateStr = "Sabtu, 12 Desember 2026";

  // 1. BERANDA (OVERVIEW) STATE
  const [overviewPendingTasks, setOverviewPendingTasks] = useState([
    {
      id: 'ov-1',
      title: 'Tentukan tanggal pernikahan dan opsi cadangan',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: true
    },
    {
      id: 'ov-2',
      title: 'Bahas estimasi total anggaran dan pembagian kontribusi',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#10B981',
      completed: true
    },
    {
      id: 'ov-3',
      title: 'Buat daftar prioritas (elemen non-negotiable)',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
  ]);

  const toggleOverviewPendingTask = (id) => {
    setOverviewPendingTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const bersamaDone = overviewPendingTasks.filter(t => t.completed).length;
  const bersamaTotal = overviewPendingTasks.length + 3;
  const bersamaPct = Math.round((bersamaDone / bersamaTotal) * 100);

  const totalAll = 9;
  const completedAll = 2 + (overviewPendingTasks.find(t => t.id === 'ov-3')?.completed ? 1 : 0);
  const overallPct = Math.round((completedAll / totalAll) * 100);
  const remainingAll = totalAll - completedAll;

  // 2. AKTIVITAS (ACTIVITIES) STATE
  const [activitiesCategory, setActivitiesCategory] = useState('Persiapan Awal');
  const [activitiesPicFilter, setActivitiesPicFilter] = useState('ALL'); // 'ALL' | 'CPP' | 'CPW' | 'Bersama'

  const [activitiesCategories] = useState([
    { id: 'Persiapan Awal', name: 'Persiapan Awal', count: 9 },
    { id: 'Lamaran', name: 'Lamaran', count: 6 },
    { id: 'Seserahan, Mahar, dan Cincin', name: 'Seserahan, Mahar, dan Cincin', count: 8 },
    { id: 'Wedding Organizer', name: 'Wedding Organizer', count: 4 },
    { id: 'Venue', name: 'Venue', count: 5 },
    { id: 'Administrasi', name: 'Administrasi', count: 3 },
    { id: 'Catering', name: 'Catering', count: 7 },
    { id: 'Dekorasi', name: 'Dekorasi', count: 5 },
    { id: 'Attire', name: 'Attire', count: 4 },
    { id: 'MUA', name: 'MUA', count: 3 },
    { id: 'Dokumentasi', name: 'Dokumentasi', count: 4 },
  ]);

  const [activitiesTasks, setActivitiesTasks] = useState([
    { id: 'act-1', category: 'Persiapan Awal', title: 'Tentukan tanggal pernikahan dan opsi cadangan', due_date: '30/09/2026', pic: 'Bersama', is_completed: true },
    { id: 'act-2', category: 'Persiapan Awal', title: 'Bahas estimasi total anggaran dan pembagian kontribusi', due_date: '05/10/2026', pic: 'Bersama', is_completed: true },
    { id: 'act-3', category: 'Persiapan Awal', title: 'Buat daftar prioritas (elemen non-negotiable)', due_date: '10/10/2026', pic: 'Bersama', is_completed: false },
    { id: 'act-4', category: 'Persiapan Awal', title: 'Susun perkiraan jumlah tamu kasar (CPP & CPW)', due_date: '15/10/2026', pic: 'Bersama', is_completed: false },
    { id: 'act-5', category: 'Persiapan Awal', title: 'Diskusi konsep pernikahan impian (tradisional/modern)', due_date: '18/10/2026', pic: 'CPW', is_completed: false },
    { id: 'act-6', category: 'Persiapan Awal', title: 'Survei awal referensi vendor dan venue', due_date: '25/10/2026', pic: 'CPP', is_completed: false },
    { id: 'act-7', category: 'Persiapan Awal', title: 'Buat rekening bersama untuk dana pernikahan', due_date: '28/10/2026', pic: 'CPP', is_completed: false },
    { id: 'act-8', category: 'Persiapan Awal', title: 'Pilih cincin tunangan / kawin', due_date: '02/11/2026', pic: 'CPW', is_completed: false },
    { id: 'act-9', category: 'Persiapan Awal', title: 'Fitting kebaya & jas perdana', due_date: '10/11/2026', pic: 'CPW', is_completed: false },

    // Other categories tasks for rich interaction
    { id: 'act-10', category: 'Lamaran', title: 'Pertemuan silaturahmi keluarga besar & perkenalan orang tua', due_date: '12/10/2026', pic: 'Bersama', is_completed: true },
    { id: 'act-11', category: 'Lamaran', title: 'Penyusunan hantaran lamaran simbolis', due_date: '20/10/2026', pic: 'CPP', is_completed: false },
    { id: 'act-12', category: 'Venue', title: 'Booking Ballroom Sasana Kriya TMII', due_date: '15/05/2026', pic: 'CPP', is_completed: true },
    { id: 'act-13', category: 'Venue', title: 'Survei layout panggung dan loading barang vendor', due_date: '15/09/2026', pic: 'Bersama', is_completed: false },
    { id: 'act-14', category: 'Administrasi', title: 'Pendaftaran Berkas Nikah & Kursus Pra-Nikah KUA', due_date: '10/08/2026', pic: 'CPP', is_completed: false },
    { id: 'act-15', category: 'Catering', title: 'Food Tasting 500 Pax bersama orang tua', due_date: '10/07/2026', pic: 'Bersama', is_completed: true },
  ]);

  const toggleActivitiesTask = (id) => {
    setActivitiesTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
  };

  // 3. JADWAL (TIMELINE) STATE
  const [unscheduledTasks, setUnscheduledTasks] = useState([
    { id: 'unsch-1', title: 'Diskusi konsep souvenir unik & ramah lingkungan', pic: 'CPW', is_completed: false },
    { id: 'unsch-2', title: 'Booking fotografer sesi pre-wedding outdoor', pic: 'Bersama', is_completed: false },
    { id: 'unsch-3', title: 'Persiapan dokumen surat pengantar RT/RW (N1-N4)', pic: 'CPP', is_completed: false },
  ]);

  const toggleUnscheduledTask = (id) => {
    setUnscheduledTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
  };

  // 4. ANGGARAN (BUDGET) STATE
  const [budgetSubTab, setBudgetSubTab] = useState('budgeting'); // 'budgeting' | 'dana-nikah' | 'pembayaran'
  const [budgetActivePlan, setBudgetActivePlan] = useState('Plan A');
  const [budgetSearch, setBudgetSearch] = useState('');

  const [budgetItems] = useState([
    { id: 1, item: 'Sewa Gedung & Listrik (Full Day)', vendor: 'Sasana Kriya TMII', budget: 'Rp 35.000.000', actual: 'Rp 35.000.000', paid: 'Rp 25.000.000', sisa: 'Rp 10.000.000', status: 'Cicilan' },
    { id: 2, item: 'Catering Buffet 400 Pax + 4 Gubukan', vendor: 'Puspa Catering', budget: 'Rp 32.000.000', actual: 'Rp 32.000.000', paid: 'Rp 16.000.000', sisa: 'Rp 16.000.000', status: 'Cicilan' },
    { id: 3, item: 'Dekorasi Pelaminan & Photobooth 360', vendor: 'Diva Decoration', budget: 'Rp 12.000.000', actual: 'Rp 12.000.000', paid: 'Rp 12.000.000', sisa: 'Rp 0', status: 'Lunas' },
    { id: 4, item: 'Dokumentasi Foto & Cinematic Video 4K', vendor: 'Kelik Photography', budget: 'Rp 6.000.000', actual: 'Rp 6.000.000', paid: 'Rp 3.000.000', sisa: 'Rp 3.000.000', status: 'Cicilan' },
    { id: 5, item: 'MUA Pengantin & Orang Tua (Akad + Resepsi)', vendor: 'Sanggar Liza MUA', budget: 'Rp 4.500.000', actual: 'Rp 4.500.000', paid: 'Rp 4.500.000', sisa: 'Rp 0', status: 'Lunas' },
    { id: 6, item: 'MC & Acoustic Live Music Entertainment', vendor: 'Harmoni Music', budget: 'Rp 3.500.000', actual: 'Rp 3.500.000', paid: 'Rp 3.500.000', sisa: 'Rp 0', status: 'Lunas' },
  ]);

  // 5. SESERAHAN STATE
  const [seserahanFilter, setSeserahanFilter] = useState('all'); // 'all' | 'pending' | 'bought' | 'selected'

  const [seserahanItems, setSeserahanItems] = useState([
    { id: 'ses-1', title: 'Set Mukena Sutra & Sajadah Premium', price: 'Rp 1.450.000', selected_product: 'Mukena Silk Bordir Exclusive', link: 'https://shopee.co.id', is_bought: true },
    { id: 'ses-2', title: 'Set Skincare & Treatment Glowing', price: 'Rp 2.200.000', selected_product: 'Laneige Glowing Package', link: 'https://shopee.co.id', is_bought: true },
    { id: 'ses-3', title: 'Sepatu Heels & Tas Pesta', price: 'Rp 3.100.000', selected_product: 'Charles & Keith Nude Heels', link: 'https://shopee.co.id', is_bought: true },
    { id: 'ses-4', title: 'Set Perhiasan Kalung & Gelang Emas', price: 'Rp 8.500.000', selected_product: 'Semar Nusantara Golden Rose', link: 'https://shopee.co.id', is_bought: true },
    { id: 'ses-5', title: 'Set Bedcover & Sprei Tencel King Size', price: 'Rp 1.250.000', selected_product: 'Kintakun Tencel Luxury', link: 'https://shopee.co.id', is_bought: false },
    { id: 'ses-6', title: 'Parfum Eau De Parfum Signature', price: 'Rp 1.850.000', selected_product: 'Jo Malone English Pear 100ml', link: 'https://shopee.co.id', is_bought: false },
  ]);

  const toggleSeserahanItem = (id) => {
    setSeserahanItems(prev => prev.map(s => s.id === id ? { ...s, is_bought: !s.is_bought } : s));
  };

  const boughtSeserahanCount = seserahanItems.filter(s => s.is_bought).length;
  const seserahanPercent = Math.round((boughtSeserahanCount / seserahanItems.length) * 100);

  // 6. VENDOR STATE
  const [vendorFilter, setVendorFilter] = useState('All Vendors');
  const [vendorSort, setVendorSort] = useState('favorite_first');
  const [vendorSearch, setVendorSearch] = useState('');

  const [vendorsList, setVendorsList] = useState([
    {
      id: 'v-1',
      name: 'Sasana Kriya TMII',
      category: 'Venue',
      rating: '5.0',
      description: 'Ballroom Mandira, AC Central, Kursi 500, Ruang Rias VIP Pengantin & Keluarga.',
      note: 'Sudah booking DP 30%, pelunasan H-30.',
      contact_name: 'Ibu Ratna (Marketing)',
      contact_phone: '0812-9876-2341',
      price: 'Rp 35.000.000',
      is_favorite: true,
      is_chosen: true
    },
    {
      id: 'v-2',
      name: 'Puspa Catering Wedding',
      category: 'Catering',
      rating: '4.9',
      description: 'Buffet 400 Pax + 4 Stall Gubukan (Zuppa Soup, Roast Beef, Sate Ayam, Siomay Bandung).',
      note: 'Bonus free food testing untuk 6 orang keluarga inti.',
      contact_name: 'Mas Hendra (Catering Manager)',
      contact_phone: '0813-1122-3344',
      price: 'Rp 32.000.000',
      is_favorite: true,
      is_chosen: true
    },
    {
      id: 'v-3',
      name: 'Diva Decoration Jakarta',
      category: 'Dekorasi',
      rating: '4.8',
      description: 'Pelaminan Modern Minimalis 12m, Fresh Flowers Lokal & Impor, Pergola Masuk & Photobooth 360.',
      note: 'Warna tema dominan Maroon, Rose Gold, dan Warm White.',
      contact_name: 'Mbak Diva',
      contact_phone: '0817-5566-7788',
      price: 'Rp 12.000.000',
      is_favorite: true,
      is_chosen: true
    },
    {
      id: 'v-4',
      name: 'Kelik Photography & Cinema',
      category: 'Dokumentasi',
      rating: '4.9',
      description: '2 Fotografer + 2 Videografer, Drone 4K Footage, Same Day Edit Video, Album Hardcover Kolase.',
      note: 'Termasuk all softcopy master file dikirim via Flashdisk Box Kayu.',
      contact_name: 'Mas Kelik',
      contact_phone: '0819-2233-4455',
      price: 'Rp 6.000.000',
      is_favorite: false,
      is_chosen: false
    }
  ]);

  const toggleVendorFav = (id) => {
    setVendorsList(prev => prev.map(v => v.id === id ? { ...v, is_favorite: !v.is_favorite } : v));
  };

  const toggleVendorChosen = (id) => {
    setVendorsList(prev => prev.map(v => v.id === id ? { ...v, is_chosen: !v.is_chosen } : v));
  };

  // 7. TAMU (GUEST LIST) STATE
  const [guestFilter, setGuestFilter] = useState('all'); // 'all' | 'regular' | 'vip'
  const [guestSearch, setGuestSearch] = useState('');

  const [guestList] = useState([
    { id: 1, name: 'Bpk. Ir. H. Bambang & Keluarga', initials: 'HB', category: 'Tamu CPP (Dhova)', type: 'VIP', pax: 4 },
    { id: 2, name: 'dr. Amanda Clarissa & Suami', initials: 'AC', category: 'Tamu CPW (Maipa)', type: 'VIP', pax: 2 },
    { id: 3, name: 'Keluarga Besar Alm. H. Mansyur', initials: 'HM', category: 'Tamu CPW (Maipa)', type: 'Keluarga', pax: 6 },
    { id: 4, name: 'Tim Product & Tech PT Inovasi', initials: 'TI', category: 'Tamu CPP (Dhova)', type: 'Teman', pax: 10 },
    { id: 5, name: 'Rian Aditya (Bestman Dhova)', initials: 'RA', category: 'Tamu CPP (Dhova)', type: 'VIP', pax: 1 },
    { id: 6, name: 'Dini Septiani (Bridesmaid Maipa)', initials: 'DS', category: 'Tamu CPW (Maipa)', type: 'VIP', pax: 1 },
    { id: 7, name: 'Ahmad Fauzi & Istri', initials: 'AF', category: 'Tamu CPP (Dhova)', type: 'Teman', pax: 2 },
    { id: 8, name: 'Keluarga Ibu Hj. Nurbaeti', initials: 'HN', category: 'Tamu CPW (Maipa)', type: 'Keluarga', pax: 5 },
  ]);

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
            { id: 'timeline', icon: <Calendar size={15} />, label: 'Jadwal' },
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
              <span>amarawedding.id/{activePreviewTab === 'overview' ? 'overview' : activePreviewTab === 'activities' ? 'activities' : activePreviewTab === 'timeline' ? 'timeline' : activePreviewTab === 'budget' ? 'budget' : activePreviewTab === 'seserahan' ? 'seserahan' : activePreviewTab === 'guests' ? 'guest-list' : activePreviewTab === 'vendor' ? 'vendor' : activePreviewTab}</span>
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
                    className={`preview-sidebar-link ${activePreviewTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActivePreviewTab('timeline')}
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
                    onClick={() => alert("Pengaturan akun lengkap akan aktif otomatis setelah aktivasi akses Anda.")}
                  >
                    <Settings size={18} />
                    <span>Pengaturan</span>
                  </button>
                </li>
              </ul>

              <div className="preview-sidebar-footer">
                <button type="button" className="preview-btn-logout" onClick={() => alert("Fitur demo trial interaktif Amara untuk calon pembeli.")}>
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

              {/* =========================================================================
                  TAB 2: AKTIVITAS (ACTIVITIES) - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'activities' && (
                <div className="activities-container">
                  <header className="page-header">
                    <div>
                      <h1>Daftar Tugas Pernikahan</h1>
                      <p className="subtitle">Susun rencana pernikahan Anda</p>
                    </div>
                  </header>

                  <div className="activities-grid">
                    {/* Left Column: Langkah 1 - Pilih Kategori */}
                    <div className="categories-card">
                      <div className="card-header">
                        <div>
                          <h3>Langkah 1: Pilih Kategori</h3>
                          <p>Pilih kategori untuk melihat tugas</p>
                        </div>
                        <Search size={18} className="icon-muted" />
                      </div>

                      <ul className="category-list">
                        {activitiesCategories.map(cat => (
                          <li
                            key={cat.id}
                            className={`category-item ${activitiesCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => setActivitiesCategory(cat.id)}
                          >
                            <span>{cat.name}</span>
                            <span className="category-task-count">
                              {activitiesTasks.filter(t => t.category === cat.id).length || cat.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Langkah 2 - Sesuaikan Tugas */}
                    <div className="tasks-card">
                      <div className="card-header">
                        <div>
                          <h3>Langkah 2: Sesuaikan Tugas</h3>
                          <p>Ceklis jika sudah selesai</p>
                        </div>
                      </div>

                      <div className="active-category-header">
                        <h4>{activitiesCategory}</h4>
                      </div>

                      {/* PIC Filter Pills */}
                      <div className="pic-filter-pills">
                        <button
                          type="button"
                          className={`pic-filter-btn ${activitiesPicFilter === 'ALL' ? 'active' : ''}`}
                          onClick={() => setActivitiesPicFilter('ALL')}
                        >
                          <span>Semua</span>
                          <span className="pic-filter-count">
                            {activitiesTasks.filter(t => t.category === activitiesCategory).length}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`pic-filter-btn ${activitiesPicFilter === 'CPP' ? 'active' : ''}`}
                          onClick={() => setActivitiesPicFilter('CPP')}
                        >
                          <span>Tugas Dhova</span>
                          <span className="pic-filter-count">
                            {activitiesTasks.filter(t => t.category === activitiesCategory && t.pic === 'CPP').length}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`pic-filter-btn ${activitiesPicFilter === 'CPW' ? 'active' : ''}`}
                          onClick={() => setActivitiesPicFilter('CPW')}
                        >
                          <span>Tugas Maipa</span>
                          <span className="pic-filter-count">
                            {activitiesTasks.filter(t => t.category === activitiesCategory && t.pic === 'CPW').length}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`pic-filter-btn ${activitiesPicFilter === 'Bersama' ? 'active' : ''}`}
                          onClick={() => setActivitiesPicFilter('Bersama')}
                        >
                          <span>Tugas Bersama</span>
                          <span className="pic-filter-count">
                            {activitiesTasks.filter(t => t.category === activitiesCategory && t.pic === 'Bersama').length}
                          </span>
                        </button>
                      </div>

                      {/* Task Items List */}
                      <ul className="task-list-details">
                        {activitiesTasks
                          .filter(t => t.category === activitiesCategory)
                          .filter(t => activitiesPicFilter === 'ALL' ? true : t.pic === activitiesPicFilter)
                          .map(task => (
                            <li
                              key={task.id}
                              className="task-item-detail"
                              onClick={() => toggleActivitiesTask(task.id)}
                            >
                              <div className="task-detail-left">
                                <button
                                  type="button"
                                  className={`btn-check ${task.is_completed ? 'checked' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleActivitiesTask(task.id);
                                  }}
                                >
                                  {task.is_completed && <Check size={12} color="white" strokeWidth={3} />}
                                </button>
                                <div className="task-detail-body">
                                  <span className={`task-detail-title ${task.is_completed ? 'completed' : ''}`}>
                                    {task.title}
                                  </span>
                                  <div className="task-detail-meta">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Calendar size={12} /> {task.due_date}
                                    </span>
                                    <span className={`task-pic-badge pic-${task.pic.toLowerCase()}`}>
                                      {task.pic === 'CPP' ? 'Tugas Dhova' : task.pic === 'CPW' ? 'Tugas Maipa' : 'Tugas Bersama'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-muted)' }}>
                                <Edit2 size={15} style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()} />
                                <Trash2 size={15} style={{ cursor: 'pointer', color: 'var(--color-danger, #EF4444)' }} onClick={(e) => e.stopPropagation()} />
                              </div>
                            </li>
                          ))}
                      </ul>

                      <button
                        type="button"
                        className="btn-add-task-real"
                        onClick={() => alert("Form Tambah Tugas Pernikahan interaktif akan terbuka di aplikasi Amara.")}
                      >
                        + Tambah Tugas
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 3: JADWAL (TIMELINE) - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'timeline' && (
                <div className="timeline-container">
                  <header className="page-header">
                    <div>
                      <h1>Jadwal Persiapan Pernikahan</h1>
                      <p className="subtitle">72 hari lagi menuju pernikahanmu! • Kelola jadwal persiapan pernikahan Anda</p>
                    </div>
                  </header>

                  {/* Overall Progress Card */}
                  <div className="timeline-progress-banner">
                    <div className="timeline-progress-header">
                      <div>
                        <div className="timeline-progress-title">Progres Keseluruhan</div>
                        <div className="timeline-progress-value">{overallPct}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Tugas Selesai</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{completedAll}/{totalAll}</strong>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${overallPct}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>

                  <div className="timeline-split-layout">
                    {/* Left Column: Timeline Events Log */}
                    <div className="timeline-main-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Timeline</h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span> Selesai
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span> Terjadwal
                          </span>
                        </div>
                      </div>

                      {/* Month: September 2026 */}
                      <div className="timeline-month-divider">
                        <span className="timeline-month-badge">September 2026</span>
                      </div>

                      <div className="timeline-track-item">
                        <div className="timeline-heart-icon completed">
                          <Heart size={15} fill="#10B981" color="#10B981" />
                        </div>
                        <div className="timeline-event-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button type="button" className="btn-check checked" style={{ width: '18px', height: '18px' }}>
                              <Check size={10} color="white" />
                            </button>
                            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
                              Tentukan tanggal pernikahan dan opsi cadangan
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> 30/09/2026</span>
                            <span className="task-pic-badge pic-bersama">Tugas Bersama</span>
                          </div>
                        </div>
                      </div>

                      {/* Month: Oktober 2026 */}
                      <div className="timeline-month-divider">
                        <span className="timeline-month-badge">Oktober 2026</span>
                      </div>

                      <div className="timeline-track-item">
                        <div className="timeline-heart-icon completed">
                          <Heart size={15} fill="#10B981" color="#10B981" />
                        </div>
                        <div className="timeline-event-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button type="button" className="btn-check checked" style={{ width: '18px', height: '18px' }}>
                              <Check size={10} color="white" />
                            </button>
                            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
                              Bahas estimasi total anggaran dan pembagian kontribusi
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> 05/10/2026</span>
                            <span className="task-pic-badge pic-bersama">Tugas Bersama</span>
                          </div>
                        </div>
                      </div>

                      <div className="timeline-track-item">
                        <div className="timeline-heart-icon">
                          <Heart size={15} color="var(--color-text-muted)" />
                        </div>
                        <div className="timeline-event-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button type="button" className="btn-check" style={{ width: '18px', height: '18px' }}></button>
                            <span style={{ color: 'var(--color-text)', fontSize: '0.88rem', fontWeight: 600 }}>
                              Survei awal referensi vendor dan venue
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> 25/10/2026</span>
                            <span className="task-pic-badge pic-cpp">Tugas Dhova</span>
                          </div>
                        </div>
                      </div>

                      {/* Month: Desember 2026 - Wedding Day Highlight */}
                      <div className="timeline-month-divider">
                        <span className="timeline-month-badge">Desember 2026</span>
                      </div>

                      <div className="timeline-track-item">
                        <div className="timeline-heart-icon" style={{ background: '#99182A', borderColor: '#99182A' }}>
                          <Heart size={15} fill="white" color="white" />
                        </div>
                        <div className="timeline-event-card wedding-day-special-card">
                          <div>
                            <h4>Hari Pernikahan Dhova & Maipa</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Sabtu, 12 Desember 2026
                            </p>
                          </div>
                          <span className="badge-dday">Hari H</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Belum Terjadwal & Mini Calendar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="unscheduled-card">
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800 }}>Tugas Belum Terjadwal</h3>
                        <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Tugas yang belum memiliki tenggat waktu.
                        </p>

                        <div className="unscheduled-list">
                          {unscheduledTasks.map(t => (
                            <div key={t.id} className="unscheduled-item" onClick={() => toggleUnscheduledTask(t.id)}>
                              <button
                                type="button"
                                className={`btn-check ${t.is_completed ? 'checked' : ''}`}
                                style={{ width: '18px', height: '18px' }}
                              >
                                {t.is_completed && <Check size={10} color="white" />}
                              </button>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: t.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: t.is_completed ? 'line-through' : 'none' }}>
                                  {t.title}
                                </div>
                                <span className={`task-pic-badge pic-${t.pic.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                                  {t.pic === 'CPP' ? 'Dhova' : t.pic === 'CPW' ? 'Maipa' : 'Bersama'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mini Calendar Widget Mock */}
                      <div className="unscheduled-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>Oktober 2026</span>
                          <Calendar size={15} className="icon-muted" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.72rem' }}>
                          {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                            <span key={i} style={{ color: 'var(--color-text-muted)', fontWeight: 700, padding: '4px 0' }}>{d}</span>
                          ))}
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <span
                              key={day}
                              style={{
                                padding: '6px 0',
                                borderRadius: '6px',
                                fontWeight: day === 12 || day === 5 || day === 25 ? 700 : 500,
                                background: day === 12 ? 'var(--color-primary)' : day === 5 ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                color: day === 12 ? '#ffffff' : day === 5 ? '#059669' : 'var(--color-text)'
                              }}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 4: ANGGARAN (BUDGET) - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'budget' && (
                <div className="budget-container">
                  <header className="page-header budget-page-header">
                    <div>
                      <h1>Anggaran Pernikahan</h1>
                      <p className="subtitle">Rencanakan dan pantau anggaran pernikahan Anda</p>
                    </div>

                    <div className="budget-nav-tabs">
                      <button
                        type="button"
                        className={`budget-tab-pill ${budgetSubTab === 'budgeting' ? 'active' : ''}`}
                        onClick={() => setBudgetSubTab('budgeting')}
                      >
                        BUDGETING
                      </button>
                      <button
                        type="button"
                        className={`budget-tab-pill ${budgetSubTab === 'dana-nikah' ? 'active' : ''}`}
                        onClick={() => setBudgetSubTab('dana-nikah')}
                      >
                        DANA NIKAH
                      </button>
                      <button
                        type="button"
                        className={`budget-tab-pill ${budgetSubTab === 'pembayaran' ? 'active' : ''}`}
                        onClick={() => setBudgetSubTab('pembayaran')}
                      >
                        PEMBAYARAN
                      </button>
                    </div>
                  </header>

                  {/* Sub-view 1: BUDGETING */}
                  {budgetSubTab === 'budgeting' && (
                    <>
                      <div className="budgeting-top-grid">
                        <div className="target-budget-card">
                          <div className="target-card-top">
                            <span className="target-card-label">TARGET BUDGET</span>
                            <button type="button" className="btn-atur-target">
                              ATUR TARGET <Edit3 size={11} style={{ marginLeft: '4px' }} />
                            </button>
                          </div>
                          <h2 className="target-card-amount">Rp 120.000.000</h2>
                          <div className="target-progress-bg">
                            <div className="target-progress-fill" style={{ width: '71%' }}></div>
                          </div>
                          <div className="target-progress-labels">
                            <span>71% TERPAKAI</span>
                            <span>Rp 85.500.000 / 120jt</span>
                          </div>
                        </div>

                        <div className="estimasi-biaya-card">
                          <div className="estimasi-card-header">
                            <span className="estimasi-card-label">ESTIMASI BIAYA ({budgetActivePlan})</span>
                            <span className="estimasi-badge safe">SISA Rp 34.500.000</span>
                          </div>
                          <h2 className="estimasi-card-amount">Rp 85.500.000</h2>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            <span>Estimasi Total Pengeluaran Plan A</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>Surplus Aman</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls Bar: Plan Tabs & Search */}
                      <div className="budgeting-controls-bar">
                        <div className="budgeting-plan-bar">
                          <button
                            type="button"
                            className={`plan-tab-item ${budgetActivePlan === 'Plan A' ? 'active' : ''}`}
                            onClick={() => setBudgetActivePlan('Plan A')}
                          >
                            Plan A
                          </button>
                          <button
                            type="button"
                            className={`plan-tab-item ${budgetActivePlan === 'Plan B' ? 'active' : ''}`}
                            onClick={() => setBudgetActivePlan('Plan B')}
                          >
                            Plan B (Grand Ballroom)
                          </button>
                          <button type="button" className="plan-tab-item" onClick={() => alert("Tambah skenario plan anggaran baru")}>
                            +
                          </button>

                          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                            <button type="button" className="plan-tab-item" title="Duplikasi Plan"><Copy size={13} /></button>
                            <button type="button" className="plan-tab-item" title="Ubah Nama Plan"><Edit2 size={13} /></button>
                            <button type="button" className="plan-tab-item" title="Komparasi Skenario"><BarChart2 size={13} /></button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface-solid)', padding: '6px 14px', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--color-border)', width: '240px' }}>
                          <Search size={14} className="icon-muted" />
                          <input
                            type="text"
                            placeholder="Cari kebutuhan..."
                            value={budgetSearch}
                            onChange={(e) => setBudgetSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', width: '100%', color: 'var(--color-text)' }}
                          />
                        </div>
                      </div>

                      {/* Budget Table */}
                      <div className="budget-table-card">
                        <table className="real-budget-table">
                          <thead>
                            <tr>
                              <th style={{ width: '45%' }}>KEBUTUHAN</th>
                              <th style={{ width: '30%' }}>VENDOR</th>
                              <th style={{ width: '20%' }}>BUDGET</th>
                              <th style={{ width: '5%', textAlign: 'center' }}>AKSI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {budgetItems
                              .filter(b => !budgetSearch || b.item.toLowerCase().includes(budgetSearch.toLowerCase()) || b.vendor.toLowerCase().includes(budgetSearch.toLowerCase()))
                              .map(item => (
                                <tr key={item.id}>
                                  <td><strong>{item.item}</strong></td>
                                  <td><span style={{ color: 'var(--color-text-muted)' }}>{item.vendor}</span></td>
                                  <td><strong style={{ color: 'var(--color-primary)' }}>{item.budget}</strong></td>
                                  <td style={{ textAlign: 'center' }}>
                                    <Trash2 size={14} style={{ color: 'var(--color-danger, #EF4444)', cursor: 'pointer' }} />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <button
                          type="button"
                          className="btn-add-task-real"
                          style={{ marginTop: '16px' }}
                          onClick={() => alert("Tambah Pengeluaran Anggaran baru")}
                        >
                          + Tambah Pengeluaran
                        </button>
                      </div>
                    </>
                  )}

                  {/* Sub-view 2: DANA NIKAH */}
                  {budgetSubTab === 'dana-nikah' && (
                    <div className="budget-table-card">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--color-background)', padding: '16px', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>TABUNGAN DHOVA (CPP)</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.4rem', color: '#4A1A5D', fontWeight: 800 }}>Rp 65.000.000</h3>
                        </div>
                        <div style={{ background: 'var(--color-background)', padding: '16px', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>TABUNGAN MAIPA (CPW)</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.4rem', color: '#E11D48', fontWeight: 800 }}>Rp 55.000.000</h3>
                        </div>
                        <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                          <span style={{ fontSize: '0.76rem', color: '#065F46', fontWeight: 700 }}>TOTAL DANA NIKAH TERKUMPUL</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.4rem', color: '#059669', fontWeight: 800 }}>Rp 120.000.000 (100%)</h3>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
                        ✓ Seluruh target dana nikah Dhova & Maipa telah terkumpul penuh di rekening bersama.
                      </p>
                    </div>
                  )}

                  {/* Sub-view 3: PEMBAYARAN */}
                  {budgetSubTab === 'pembayaran' && (
                    <div className="budget-table-card">
                      <table className="real-budget-table">
                        <thead>
                          <tr>
                            <th>KEBUTUHAN</th>
                            <th>VENDOR</th>
                            <th>AKTUAL</th>
                            <th>DIBAYAR</th>
                            <th>SISA</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {budgetItems.map(item => (
                            <tr key={item.id}>
                              <td><strong>{item.item}</strong></td>
                              <td>{item.vendor}</td>
                              <td><strong>{item.actual}</strong></td>
                              <td style={{ color: '#059669', fontWeight: 700 }}>{item.paid}</td>
                              <td style={{ color: item.sisa === 'Rp 0' ? 'var(--color-text-muted)' : '#D97706', fontWeight: 700 }}>{item.sisa}</td>
                              <td>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: item.status === 'Lunas' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                                  color: item.status === 'Lunas' ? '#059669' : '#D97706'
                                }}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  TAB 5: SESERAHAN - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'seserahan' && (
                <div className="seserahan-container">
                  <header className="page-header">
                    <div>
                      <h1>Daftar Seserahan</h1>
                      <p className="subtitle">Rencanakan dan kelola barang seserahan pernikahan Anda</p>
                    </div>
                  </header>

                  {/* Progress Seserahan Card */}
                  <div className="seserahan-progress-card">
                    <div className="seserahan-progress-header">
                      <h3>Progress Seserahan</h3>
                      <span className="seserahan-progress-meta">
                        {boughtSeserahanCount} dari {seserahanItems.length} item telah dibeli
                      </span>
                    </div>
                    <div className="seserahan-progress-percent">{seserahanPercent}%</div>
                    <div className="seserahan-progress-track">
                      <div className="seserahan-progress-fill" style={{ width: `${seserahanPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="seserahan-main-grid">
                    {/* Left Column: DAFTAR SESERAHAN */}
                    <div className="seserahan-list-card">
                      <div className="seserahan-list-header">
                        <div>
                          <h2>DAFTAR SESERAHAN</h2>
                          <span className="seserahan-count-caption">{seserahanItems.length} item terdaftar</span>
                        </div>
                        <button type="button" className="btn-tambah-seserahan" onClick={() => alert("Tambah item seserahan baru")}>
                          + Tambah
                        </button>
                      </div>

                      {/* Filter Status */}
                      <div className="seserahan-filter-bar">
                        {[
                          { id: 'all', label: `Semua (${seserahanItems.length})` },
                          { id: 'pending', label: `Perlu Disiapkan (${seserahanItems.length - boughtSeserahanCount})` },
                          { id: 'bought', label: `Sudah Siap (${boughtSeserahanCount})` },
                          { id: 'selected', label: `Produk Terpilih (${seserahanItems.length})` },
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            className={`seserahan-filter-pill ${seserahanFilter === f.id ? 'active' : ''}`}
                            onClick={() => setSeserahanFilter(f.id)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {/* Seserahan Item Blocks */}
                      <div className="seserahan-items-wrapper">
                        {seserahanItems
                          .filter(s => {
                            if (seserahanFilter === 'pending') return !s.is_bought;
                            if (seserahanFilter === 'bought') return s.is_bought;
                            return true;
                          })
                          .map(item => (
                            <div key={item.id} className={`seserahan-item-block ${item.is_bought ? 'is-bought' : ''}`}>
                              <div className="seserahan-main-row">
                                <div className="seserahan-row-left">
                                  <button
                                    type="button"
                                    className={`seserahan-checkbox ${item.is_bought ? 'checked' : ''}`}
                                    onClick={() => toggleSeserahanItem(item.id)}
                                  >
                                    {item.is_bought && <Check size={12} color="white" strokeWidth={3} />}
                                  </button>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span className={`seserahan-item-title ${item.is_bought ? 'bought' : ''}`}>
                                        {item.title}
                                      </span>
                                      <span style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                                        {item.price}
                                      </span>
                                    </div>
                                    <div style={{ marginTop: '4px' }}>
                                      <span className="seserahan-selected-chip">
                                        <CheckCircle2 size={12} />
                                        <span>Pilihan: {item.selected_product}</span>
                                      </span>
                                      <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="seserahan-sub-link"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        Lihat Produk <ExternalLink size={10} />
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-muted)' }}>
                                  <Edit2 size={14} style={{ cursor: 'pointer' }} />
                                  <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--color-danger, #EF4444)' }} />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Right Column: REKOMENDASI PRODUK */}
                    <div className="seserahan-recs-card">
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800 }}>REKOMENDASI PRODUK</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { title: 'Mukena Silk Renda Mewah', cat: 'Perlengkapan Ibadah', price: 'Rp 450.000' },
                          { title: 'Kalung Emas 17K Rose Gold', cat: 'Perhiasan', price: 'Rp 4.200.000' },
                          { title: 'Set Bedcover Sutra Organik', cat: 'Alat Tidur', price: 'Rp 850.000' },
                          { title: 'Chanel Coco Mademoiselle EDP', cat: 'Toiletries', price: 'Rp 2.850.000' }
                        ].map((rec, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-background)', borderRadius: '10px' }}>
                            <div>
                              <strong style={{ fontSize: '0.82rem', display: 'block' }}>{rec.title}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{rec.cat} • {rec.price}</span>
                            </div>
                            <button
                              type="button"
                              className="btn-tambah-seserahan"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              onClick={() => alert(`Item "${rec.title}" ditambahkan ke seserahan!`)}
                            >
                              + Tambah
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 6: VENDOR - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'vendor' && (
                <div className="vendor-container">
                  <header className="page-header">
                    <div>
                      <h1>Tim Vendor</h1>
                      <p className="subtitle">Kelola dan bandingkan daftar vendor pernikahan Anda</p>
                    </div>
                    <button type="button" className="btn-add-task-real" style={{ width: 'auto', background: 'var(--color-primary)', color: '#ffffff', border: 'none' }} onClick={() => alert("Tambah Vendor baru")}>
                      + Tambah Vendor
                    </button>
                  </header>

                  {/* Search & Sort Row */}
                  <div className="vendor-search-bar-row">
                    <div className="vendor-search-input-wrap">
                      <Search size={16} className="icon-muted" />
                      <input
                        type="text"
                        placeholder="Cari vendor..."
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '100%', color: 'var(--color-text)' }}
                      />
                    </div>
                    <select
                      className="vendor-sort-select"
                      value={vendorSort}
                      onChange={(e) => setVendorSort(e.target.value)}
                    >
                      <option value="favorite_first">❤️ Favorit Terlebih Dahulu</option>
                      <option value="rating_desc">Rating (Tertinggi)</option>
                      <option value="price_asc">Harga (Terendah)</option>
                    </select>
                  </div>

                  {/* Filter Pills */}
                  <div className="vendor-filter-pills">
                    {[
                      { id: 'All Vendors', label: `Semua Vendor (${vendorsList.length})` },
                      { id: 'Chosen Vendors', label: `Vendor Terpilih 🌟 (${vendorsList.filter(v => v.is_chosen).length})` },
                      { id: 'Favorite Vendors', label: `Favorit ❤️ (${vendorsList.filter(v => v.is_favorite).length})` },
                      { id: 'Venue', label: 'Venue (1)' },
                      { id: 'Catering', label: 'Catering (1)' },
                      { id: 'Dekorasi', label: 'Dekorasi (1)' },
                      { id: 'Dokumentasi', label: 'Dokumentasi (1)' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        className={`vendor-filter-pill ${vendorFilter === f.id ? 'active' : ''}`}
                        onClick={() => setVendorFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Vendor Cards Grid */}
                  <div className="vendor-cards-grid">
                    {vendorsList
                      .filter(v => {
                        if (vendorFilter === 'Chosen Vendors') return v.is_chosen;
                        if (vendorFilter === 'Favorite Vendors') return v.is_favorite;
                        if (['Venue', 'Catering', 'Dekorasi', 'Dokumentasi'].includes(vendorFilter)) return v.category === vendorFilter;
                        return true;
                      })
                      .filter(v => !vendorSearch || v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.category.toLowerCase().includes(vendorSearch.toLowerCase()))
                      .map(vendor => (
                        <div key={vendor.id} className={`real-vendor-card ${vendor.is_chosen ? 'chosen' : ''}`}>
                          <div>
                            <div className="real-vendor-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="vendor-avatar-circle">
                                  {vendor.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="real-vendor-name">{vendor.name}</h3>
                                  <div className="real-vendor-meta">
                                    <span className="vendor-category-chip">{vendor.category}</span>
                                    <span className="vendor-rating-chip"><Star size={13} fill="#D97706" /> {vendor.rating}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                className={`btn-vendor-heart ${vendor.is_favorite ? 'is-fav' : ''}`}
                                onClick={() => toggleVendorFav(vendor.id)}
                                title="Favorit"
                              >
                                <Heart size={18} fill={vendor.is_favorite ? '#EF4444' : 'none'} />
                              </button>
                            </div>

                            {vendor.is_chosen && (
                              <div style={{ marginTop: '10px' }}>
                                <span className="badge-vendor-chosen">
                                  <CheckCircle size={12} /> 🌟 Vendor Terpilih
                                </span>
                              </div>
                            )}

                            <div className="vendor-package-box" style={{ marginTop: '10px' }}>
                              <strong style={{ display: 'block', fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '3px' }}>DETAIL PAKET:</strong>
                              <p style={{ margin: 0 }}>{vendor.description}</p>
                            </div>

                            <div className="vendor-pic-row" style={{ marginTop: '10px' }}>
                              <span>Kontak: <strong>{vendor.contact_name}</strong></span>
                              <a
                                href={`https://wa.me/62${vendor.contact_phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vendor-wa-link"
                              >
                                <MessageCircle size={11} /> WhatsApp
                              </a>
                            </div>
                          </div>

                          <div className="vendor-price-and-action">
                            <div>
                              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Estimasi Biaya:</span>
                              <span className="vendor-card-price">{vendor.price}</span>
                            </div>

                            <button
                              type="button"
                              className={`btn-toggle-chosen ${vendor.is_chosen ? 'is-chosen' : 'not-chosen'}`}
                              onClick={() => toggleVendorChosen(vendor.id)}
                            >
                              {vendor.is_chosen ? (
                                <>
                                  <Check size={14} /> Terpilih
                                </>
                              ) : (
                                'Pilih Vendor Ini'
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 7: TAMU (GUEST LIST) - 100% AUTHENTIC TO LIVE AMARA
                  ========================================================================= */}
              {activePreviewTab === 'guests' && (
                <div className="guest-list-container">
                  <header className="page-header">
                    <div>
                      <h1>Manajemen Daftar Tamu</h1>
                      <p className="subtitle">Kelola tamu pernikahan Anda</p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-add-task-real"
                        style={{ width: 'auto', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        onClick={() => alert("Fitur Upload Tamu Excel/CSV siap digunakan")}
                      >
                        <Upload size={14} /> Unggah Tamu
                      </button>
                      <button
                        type="button"
                        className="btn-add-task-real"
                        style={{ width: 'auto', background: 'var(--color-primary)', color: '#ffffff', border: 'none' }}
                        onClick={() => alert("Tambah Tamu baru")}
                      >
                        + Tambah Tamu
                      </button>
                    </div>
                  </header>

                  {/* 5 KPI Metric Cards */}
                  <div className="guest-stats-grid">
                    <div className="guest-stat-card">
                      <div className="stat-swatch swatch-regular">
                        <Users size={18} color="#ffffff" />
                      </div>
                      <div className="stat-info">
                        <span className="stat-label">Tamu Regular</span>
                        <span className="stat-value">280</span>
                      </div>
                    </div>

                    <div className="guest-stat-card">
                      <div className="stat-swatch swatch-vip">
                        <Crown size={18} color="#ffffff" />
                      </div>
                      <div className="stat-info">
                        <span className="stat-label">Tamu VIP</span>
                        <span className="stat-value">60</span>
                      </div>
                    </div>

                    <div className="guest-stat-card">
                      <div className="stat-swatch swatch-cpw">
                        <User size={18} color="#ffffff" />
                      </div>
                      <div className="stat-info">
                        <span className="stat-label">Tamu CPW (Maipa)</span>
                        <span className="stat-value">160</span>
                      </div>
                    </div>

                    <div className="guest-stat-card">
                      <div className="stat-swatch swatch-cpp">
                        <User size={18} color="#ffffff" />
                      </div>
                      <div className="stat-info">
                        <span className="stat-label">Tamu CPP (Dhova)</span>
                        <span className="stat-value">180</span>
                      </div>
                    </div>

                    <div className="guest-stat-card stat-card-highlight">
                      <div className="stat-swatch swatch-total">
                        <Users size={18} color="#ffffff" />
                      </div>
                      <div className="stat-info">
                        <span className="stat-label">Total Tamu</span>
                        <span className="stat-value">340 Pax</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Toolbar */}
                  <div className="guest-toolbar">
                    <div className="guest-filter-pills">
                      {[
                        { id: 'all', label: `Semua Tamu (${guestList.length})` },
                        { id: 'regular', label: 'Reguler' },
                        { id: 'vip', label: 'VIP' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          className={`guest-pill ${guestFilter === f.id ? 'active' : ''}`}
                          onClick={() => setGuestFilter(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface-solid)', padding: '6px 14px', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--color-border)', width: '220px' }}>
                      <Search size={14} className="icon-muted" />
                      <input
                        type="text"
                        placeholder="Cari tamu..."
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', width: '100%', color: 'var(--color-text)' }}
                      />
                    </div>
                  </div>

                  {/* Guest Table Card */}
                  <div className="guest-table-card">
                    <table className="real-guest-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>NAMA TAMU / KELUARGA</th>
                          <th style={{ width: '22%' }}>KATEGORI</th>
                          <th style={{ width: '18%' }}>TIPE TAMU</th>
                          <th style={{ width: '12%' }}>PAX</th>
                          <th style={{ width: '8%', textAlign: 'center' }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guestList
                          .filter(g => {
                            if (guestFilter === 'vip') return g.type === 'VIP';
                            if (guestFilter === 'regular') return g.type !== 'VIP';
                            return true;
                          })
                          .filter(g => !guestSearch || g.name.toLowerCase().includes(guestSearch.toLowerCase()))
                          .map(guest => (
                            <tr key={guest.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: guest.category.includes('CPW') ? '#FCE7F3' : '#EDE9FE', color: guest.category.includes('CPW') ? '#DB2777' : '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>
                                    {guest.initials}
                                  </div>
                                  <strong style={{ color: 'var(--color-text)' }}>{guest.name}</strong>
                                </div>
                              </td>
                              <td>
                                <span className={`badge-category ${guest.category.includes('CPW') ? 'cpw' : 'cpp'}`}>
                                  {guest.category}
                                </span>
                              </td>
                              <td>
                                <span className={`badge-guest-type ${guest.type === 'VIP' ? 'vip' : 'reguler'}`}>
                                  {guest.type}
                                </span>
                              </td>
                              <td><strong>{guest.pax} Pax</strong></td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', gap: '8px', color: 'var(--color-text-muted)' }}>
                                  <Edit2 size={14} style={{ cursor: 'pointer' }} />
                                  <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--color-danger, #EF4444)' }} />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
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
