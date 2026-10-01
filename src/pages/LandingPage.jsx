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
  Wand2,
  Plus,
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

  // DEMO CONVERSION & INTERACTIVE MICRO-FEEDBACK HELPER
  const [demoFeedback, setDemoFeedback] = useState(null);
  const [demoCtaModal, setDemoCtaModal] = useState(null);
  const feedbackTimerRef = useRef(null);

  const showDemoFeedback = (message) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setDemoFeedback(message);
    feedbackTimerRef.current = setTimeout(() => {
      setDemoFeedback(null);
    }, 6000);
  };

  const openDemoCtaModal = ({ title, subtitle, icon = 'crown' }) => {
    setDemoCtaModal({ title, subtitle, icon });
  };

  const handleSelectTab = (tabId) => {
    setActivePreviewTab(tabId);
    if (tabId === 'activities') {
      showDemoFeedback("Kelola ratusan checklist persiapan pernikahan bersama pasangan, terbagi rapi per kategori & PIC.");
    } else if (tabId === 'timeline') {
      showDemoFeedback("Visualisasikan jadwal countdown menuju Hari H pernikahanmu agar tidak ada agenda yang terlewat.");
    } else if (tabId === 'budget') {
      showDemoFeedback("Hitung otomatis porsi tabungan nikah, pengeluaran per pos, dan pantau termin pembayaran ke vendor.");
    } else if (tabId === 'seserahan') {
      showDemoFeedback("Organisir barang seserahan per baki dengan estimasi budget dan tautan belanja praktis.");
    } else if (tabId === 'vendor') {
      showDemoFeedback("Bandingkan calon vendor terbaik, simpan nomor WhatsApp PIC, dan tandai vendor favoritmu.");
    } else if (tabId === 'guests') {
      showDemoFeedback("Atur tamu undangan, bedakan tamu VIP/Keluarga, dan kirim pesan RSVP via WhatsApp dalam 1 klik.");
    }
  };

  // 1. BERANDA (OVERVIEW) STATE - 100% Otentik Sesuai Amara Live App
  const [overviewPendingTasks, setOverviewPendingTasks] = useState([
    {
      id: 'ov-1',
      title: 'Budgeting',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
    {
      id: 'ov-2',
      title: 'Menentukan tema acara',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
    {
      id: 'ov-3',
      title: 'First family meeting',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
    {
      id: 'ov-4',
      title: 'Pre-marital check-up',
      category: 'Persiapan Awal',
      pic: 'Bersama',
      picName: 'Tugas Bersama',
      color: '#99182A',
      completed: false
    },
  ]);

  const toggleOverviewPendingTask = (id) => {
    setOverviewPendingTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          showDemoFeedback("Kamu baru saja mencoba fitur checklist bersama! Rasakan kemudahan berbagi tugas dengan calon pasanganmu secara realtime.");
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const pendingDoneCount = overviewPendingTasks.filter(t => t.completed).length;
  const totalAll = 9;
  const completedAll = 1 + pendingDoneCount;
  const overallPct = Math.round((completedAll / totalAll) * 100);
  const remainingAll = totalAll - completedAll;

  const bersamaDone = 1 + pendingDoneCount;
  const bersamaTotal = 9;
  const bersamaPct = Math.round((bersamaDone / bersamaTotal) * 100);

  // 2. AKTIVITAS (ACTIVITIES) STATE
  const [activitiesCategory, setActivitiesCategory] = useState('Persiapan Awal');
  const [activitiesPicFilter, setActivitiesPicFilter] = useState('ALL'); // 'ALL' | 'CPP' | 'CPW' | 'Bersama'
  const [activitiesCategorySearch, setActivitiesCategorySearch] = useState('');
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);

  const [activitiesCategories] = useState([
    { id: 'Persiapan Awal', name: 'Persiapan Awal', count: 9 },
    { id: 'Lamaran', name: 'Lamaran', count: 2 },
    { id: 'Seserahan, Mahar, dan Cincin', name: 'Seserahan, Mahar, dan Cincin', count: 0 },
    { id: 'Wedding Organizer', name: 'Wedding Organizer', count: 0 },
    { id: 'Venue', name: 'Venue', count: 2 },
    { id: 'Administrasi', name: 'Administrasi', count: 1 },
    { id: 'Catering', name: 'Catering', count: 1 },
    { id: 'Dekorasi', name: 'Dekorasi', count: 0 },
    { id: 'Attire', name: 'Attire', count: 0 },
    { id: 'MUA', name: 'MUA', count: 0 },
    { id: 'Dokumentasi', name: 'Dokumentasi', count: 0 },
    { id: 'MC & Entertainment', name: 'MC & Entertainment', count: 0 },
    { id: 'Undangan', name: 'Undangan', count: 0 },
    { id: 'Others', name: 'Others', count: 0 }
  ]);

  const [activitiesTasks, setActivitiesTasks] = useState([
    // Real tasks from user's account in Persiapan Awal
    { id: 'act-1', category: 'Persiapan Awal', title: 'Budgeting', priority: 'High', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-2', category: 'Persiapan Awal', title: 'Menentukan tema acara', priority: 'High', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-3', category: 'Persiapan Awal', title: 'First family meeting', priority: 'High', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-4', category: 'Persiapan Awal', title: 'Membuat list vendor', priority: 'Medium', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-5', category: 'Persiapan Awal', title: 'Datang ke wedding exhibition', priority: 'Low', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-6', category: 'Persiapan Awal', title: 'Mengikuti kelas pra-nikah', priority: 'Medium', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-7', category: 'Persiapan Awal', title: 'Pre-marital check-up', priority: 'High', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-8', category: 'Persiapan Awal', title: 'Membuat wedding moodboard', priority: 'Medium', due_date: '', pic: 'Bersama', is_completed: false },
    { id: 'act-9', category: 'Persiapan Awal', title: 'Menentukan tanggal lamaran dan pernikahan', priority: 'High', due_date: '30/09/2026', pic: 'Bersama', is_completed: true },

    // Other categories tasks for rich interaction
    { id: 'act-10', category: 'Lamaran', title: 'Pertemuan silaturahmi keluarga besar & perkenalan orang tua', priority: 'High', due_date: '12/10/2026', pic: 'Bersama', is_completed: true },
    { id: 'act-11', category: 'Lamaran', title: 'Penyusunan hantaran lamaran simbolis', priority: 'Medium', due_date: '20/10/2026', pic: 'CPP', is_completed: false },
    { id: 'act-12', category: 'Venue', title: 'Booking GSG', priority: 'High', due_date: '15/10/2026', pic: 'CPP', is_completed: true },
    { id: 'act-13', category: 'Venue', title: 'Survei layout panggung dan loading barang vendor', priority: 'Medium', due_date: '15/09/2026', pic: 'Bersama', is_completed: false },
    { id: 'act-14', category: 'Administrasi', title: 'Pendaftaran Berkas Nikah & Kursus Pra-Nikah KUA', priority: 'High', due_date: '10/08/2026', pic: 'CPP', is_completed: false },
    { id: 'act-15', category: 'Catering', title: 'Food Tasting KAIA Catering bersama orang tua', priority: 'Medium', due_date: '10/07/2026', pic: 'Bersama', is_completed: true },
  ]);

  const toggleActivitiesTask = (id) => {
    setActivitiesTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.is_completed;
        if (nextState) {
          showDemoFeedback("Kamu baru saja mencoba fitur checklist bersama! Rasakan kemudahan berbagi tugas dengan calon pasanganmu secara realtime.");
        }
        return { ...t, is_completed: nextState };
      }
      return t;
    }));
  };

  // Currency Formatter Helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // 3. JADWAL (TIMELINE) STATE
  const [unscheduledTasks, setUnscheduledTasks] = useState([
    { id: 'unsch-1', title: 'Diskusi konsep souvenir unik & ramah lingkungan', pic: 'CPW', is_completed: false },
    { id: 'unsch-2', title: 'Booking fotografer sesi pre-wedding outdoor', pic: 'Bersama', is_completed: false },
    { id: 'unsch-3', title: 'Persiapan dokumen surat pengantar RT/RW (N1-N4)', pic: 'CPP', is_completed: false },
  ]);

  const toggleUnscheduledTask = (id) => {
    setUnscheduledTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.is_completed;
        if (nextState) {
          showDemoFeedback("Tugas terselesaikan! Jadwal pernikahan otomatis disinkronkan ke kalender persiapan.");
        }
        return { ...t, is_completed: nextState };
      }
      return t;
    }));
  };

  // 4. ANGGARAN (BUDGET) STATE
  const [budgetSubTab, setBudgetSubTab] = useState('budgeting'); // 'budgeting' | 'dana-nikah' | 'pembayaran'
  const [budgetActivePlan, setBudgetActivePlan] = useState('Plan A');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all' | 'belum-bayar' | 'cicilan' | 'lunas'
  const [paymentSearch, setPaymentSearch] = useState('');

  // Real items from user's account & standard Amara budget
  const [budgetItems] = useState([
    { id: 1, item: 'Venue', vendor: 'GSG', budget: 'Rp 5.000.000' },
    { id: 2, item: 'Catering', vendor: 'KAIA Catering', budget: 'Rp 3.000.000' },
    { id: 3, item: 'Makeup', vendor: 'KAIA MUA', budget: 'Rp 3.000.000' },
    { id: 4, item: 'Dekorasi Pelaminan & Photobooth', vendor: 'Amara Decor', budget: 'Rp 12.000.000' },
    { id: 5, item: 'Dokumentasi Foto & Cinematic Video', vendor: 'Amara Moments', budget: 'Rp 6.000.000' },
  ]);

  // Dana Nikah Savings Entries (from user's Supabase account)
  const [demoSavings] = useState([
    { id: 'sav-1', title: 'Tabungan Dhova (CPP)', date: '01/08/2026', amount: 10000000 },
    { id: 'sav-2', title: 'Tabungan Maipa (CPW)', date: '01/09/2026', amount: 5000000 },
    { id: 'sav-3', title: 'Sisa Gaji Dhova (CPP)', date: '10/09/2026', amount: 2000000 },
  ]);

  // Pembayaran Entries (from user's Supabase account)
  const [paymentItems] = useState([
    { id: 1, item: 'Venue', vendor: 'GSG', actual: 5000000, paid: 2500000, sisa: 2500000, deadline: '15/10/2026', status: 'cicilan' },
    { id: 2, item: 'Catering', vendor: 'KAIA Catering', actual: 3000000, paid: 0, sisa: 3000000, deadline: '20/11/2026', status: 'belum-bayar' },
    { id: 3, item: 'Makeup', vendor: 'KAIA MUA', actual: 3000000, paid: 3000000, sisa: 0, deadline: '01/10/2026', status: 'lunas' },
    { id: 4, item: 'Dekorasi Pelaminan & Photobooth', vendor: 'Amara Decor', actual: 12000000, paid: 0, sisa: 12000000, deadline: '10/11/2026', status: 'belum-bayar' },
    { id: 5, item: 'Dokumentasi Foto & Cinematic Video', vendor: 'Amara Moments', actual: 6000000, paid: 0, sisa: 6000000, deadline: '05/11/2026', status: 'belum-bayar' },
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
    setSeserahanItems(prev => prev.map(s => {
      if (s.id === id) {
        const nextBought = !s.is_bought;
        if (nextBought) {
          showDemoFeedback("Item seserahan tercentang! Amara membantu memonitor pembagian baki dan estimasi pengeluaran belanja.");
        }
        return { ...s, is_bought: nextBought };
      }
      return s;
    }));
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
    setVendorsList(prev => prev.map(v => {
      if (v.id === id) {
        const nextFav = !v.is_favorite;
        if (nextFav) {
          showDemoFeedback("Vendor tersimpan di daftar favorit! Kamu dan pasangan bisa saling kurasi vendor tanpa catatan tercecer.");
        }
        return { ...v, is_favorite: nextFav };
      }
      return v;
    }));
  };

  const toggleVendorChosen = (id) => {
    setVendorsList(prev => prev.map(v => {
      if (v.id === id) {
        const nextChosen = !v.is_chosen;
        if (nextChosen) {
          showDemoFeedback("Vendor resmi terpilih! Biaya vendor otomatis terhubung dan disinkronkan ke tab Anggaran (Budgeting).");
        }
        return { ...v, is_chosen: nextChosen };
      }
      return v;
    }));
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
  const demoTaskProgress = 85;

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
                src="/hero-dual-phone.png?v=hd-v2"
                alt="Amara Mobile Apps Preview - Dual Smartphone Mockup"
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
              onClick={() => handleSelectTab(tab.id)}
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
              <span 
                className="window-real-badge" 
                style={{ cursor: 'pointer' }}
                onClick={() => showDemoFeedback("Coba klik checklist atau jelajahi menu untuk merasakan kemudahan bagi tugas dengan pasanganmu.")}
                title="Klik untuk info trial"
              >
                <span className="real-indicator-dot"></span>
                <span>Demo Interaktif • Dhova & Maipa</span>
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
                    onClick={() => handleSelectTab('overview')}
                  >
                    <Home size={18} />
                    <span>Beranda</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'activities' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('activities')}
                  >
                    <CheckSquare size={18} />
                    <span>Aktivitas</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('timeline')}
                  >
                    <Calendar size={18} />
                    <span>Jadwal</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'budget' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('budget')}
                  >
                    <DollarSign size={18} />
                    <span>Anggaran</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'seserahan' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('seserahan')}
                  >
                    <Gift size={18} />
                    <span>Seserahan</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'vendor' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('vendor')}
                  >
                    <Users size={18} />
                    <span>Vendor</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className={`preview-sidebar-link ${activePreviewTab === 'guests' ? 'active' : ''}`}
                    onClick={() => handleSelectTab('guests')}
                  >
                    <UserPlus size={18} />
                    <span>Tamu</span>
                  </button>
                </li>
                <li className="preview-sidebar-nav-item">
                  <button
                    type="button"
                    className="preview-sidebar-link"
                    onClick={() => openDemoCtaModal({
                      title: 'Pengaturan Akun & Pasangan',
                      subtitle: 'Setelah membeli akses Amara, kamu bisa menghubungkan email pasanganmu sehingga kalian berdua bisa login bersamaan di perangkat masing-masing.',
                      icon: 'users'
                    })}
                  >
                    <Settings size={18} />
                    <span>Pengaturan</span>
                  </button>
                </li>
              </ul>

              <div className="preview-sidebar-footer">
                <button 
                  type="button" 
                  className="preview-btn-logout" 
                  onClick={() => openDemoCtaModal({
                    title: 'Akses Penuh Amara Wedding',
                    subtitle: 'Nikmati seluruh fitur demo untuk merasakan kemudahan Amara sebelum membeli. Dapatkan akses seumur hidup tanpa biaya langganan bulanan.',
                    icon: 'crown'
                  })}
                >
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
                  <span><strong>Coba Langsung Fiturnya:</strong> Klik checklist tugas di bawah atau jelajahi menu untuk merasakan pengalaman pakai Amara!</span>
                </div>
                <span className="banner-badge">Demo Interaktif</span>
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
                      <div className="card preview-progress-card">
                        <div className="priority-header" style={{ width: '100%', marginBottom: '16px' }}>
                          <h3 style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>Progres Keseluruhan</h3>
                          <span 
                            className="btn-text" 
                            style={{ color: '#99182A', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                            onClick={() => handleSelectTab('activities')}
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
                        <div className="preview-pic-breakdown-container">
                          <div className="preview-pic-breakdown-title">
                            <span>PROGRES KOLABORASI PASANGAN</span>
                          </div>
                          <div className="preview-pic-breakdown-grid">
                            <div className="preview-pic-item pic-cpp">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><User size={11} /></span> Tugas Dhova
                                </span>
                                <span className="pic-breakdown-pct" style={{ color: '#2563eb' }}>0%</span>
                              </div>
                              <div className="pic-breakdown-bar">
                                <div className="pic-breakdown-bar-fill" style={{ width: '0%', background: '#2563eb' }} />
                              </div>
                              <div className="pic-breakdown-sub">
                                0 / 0 selesai
                              </div>
                            </div>

                            <div className="preview-pic-item pic-cpw">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><User size={11} /></span> Tugas Maipa
                                </span>
                                <span className="pic-breakdown-pct" style={{ color: '#db2777' }}>0%</span>
                              </div>
                              <div className="pic-breakdown-bar">
                                <div className="pic-breakdown-bar-fill" style={{ width: '0%', background: '#db2777' }} />
                              </div>
                              <div className="pic-breakdown-sub">
                                0 / 0 selesai
                              </div>
                            </div>

                            <div className="preview-pic-item pic-bersama">
                              <div className="pic-breakdown-top">
                                <span className="pic-breakdown-label">
                                  <span className="pic-icon"><Users size={11} /></span> Tugas Bersama
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

                      {/* Ringkasan Anggaran Card - 100% Matching Real Amara Overview */}
                      <div className="card preview-budget-snapshot-card">
                        <div className="priority-header" style={{ width: '100%', marginBottom: '12px' }}>
                          <h3 style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>Ringkasan Anggaran</h3>
                          <span 
                            className="btn-text" 
                            style={{ color: '#99182A', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                            onClick={() => handleSelectTab('budget')}
                          >
                            Lihat Semua
                          </span>
                        </div>
                        <div className="preview-budget-info">
                          <div className="preview-budget-item">
                            <span className="preview-budget-label">Dana Terkumpul</span>
                            <span className="preview-budget-value">Rp 120.000.000</span>
                          </div>
                          <div className="preview-budget-item">
                            <span className="preview-budget-label">Terpakai</span>
                            <span className="preview-budget-value">Rp 85.500.000</span>
                          </div>
                          <div className="preview-budget-item">
                            <span className="preview-budget-label">Tersisa</span>
                            <span className="preview-budget-value" style={{ color: '#059669' }}>Rp 34.500.000</span>
                          </div>
                        </div>
                        <div className="preview-budget-progress-bg">
                          <div className="preview-budget-progress-fill" style={{ width: '71%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Priority Card (Tugas Tertunda) */}
                    <div className="card preview-priority-card">
                      <div className="priority-header">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tugas Tertunda</h3>
                        <span 
                          className="btn-text" 
                          style={{ color: '#99182A', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                          onClick={() => handleSelectTab('activities')}
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
                              <div className="task-info" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                                <h4 style={{ 
                                  fontSize: '0.92rem', 
                                  fontWeight: 600, 
                                  margin: 0, 
                                  marginBottom: '5px',
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                                  fontFamily: 'var(--font-title)',
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.35
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
                      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
                        {!isSearchingCategory ? (
                          <>
                            <div>
                              <h3>Langkah 1</h3>
                              <p>Pilih Kategori</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsSearchingCategory(true)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                              title="Cari Kategori"
                            >
                              <Search className="icon-muted" size={20} />
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
                            <Search className="icon-muted" size={20} />
                            <input
                              type="text"
                              value={activitiesCategorySearch}
                              onChange={(e) => setActivitiesCategorySearch(e.target.value)}
                              placeholder="Search activities..."
                              style={{ flex: 1, padding: '8px', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'var(--color-text)' }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setIsSearchingCategory(false); setActivitiesCategorySearch(''); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)', lineHeight: 1 }}
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </div>

                      <ul className="category-list">
                        {activitiesCategories
                          .filter(cat => cat.name.toLowerCase().includes(activitiesCategorySearch.toLowerCase()))
                          .map(cat => {
                            const taskCount = activitiesTasks.filter(t => t.category === cat.id).length;
                            return (
                              <li
                                key={cat.id}
                                className={`category-item ${activitiesCategory === cat.id ? 'selected' : ''}`}
                                onClick={() => {
                                  setActivitiesCategory(cat.id);
                                  setActivitiesPicFilter('ALL');
                                  showDemoFeedback(`Kategori "${cat.name}": Amara menyediakan checklist cerdas siap pakai.`);
                                }}
                              >
                                <div className="category-item-row">
                                  <div className="category-item-clickable">
                                    <span className="category-item-name">{cat.name}</span>
                                  </div>
                                  <div className="category-item-meta">
                                    {taskCount > 0 && (
                                      <span className="category-task-count">{taskCount}</span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </div>

                    {/* Right Column: Langkah 2 - Sesuaikan Tugas */}
                    <div className="tasks-card">
                      <div className="card-header">
                        <div>
                          <h3>Langkah 2</h3>
                          <p>Sesuaikan Tugas</p>
                        </div>
                      </div>

                      <div className="active-category-header">
                        <h4>{activitiesCategory}</h4>
                      </div>

                      {(() => {
                        const currentCatTasks = activitiesTasks.filter(t => t.category === activitiesCategory);
                        const countAll = currentCatTasks.length;
                        const countCpp = currentCatTasks.filter(t => t.pic === 'CPP').length;
                        const countCpw = currentCatTasks.filter(t => t.pic === 'CPW').length;
                        const countBersama = currentCatTasks.filter(t => (t.pic || 'Bersama') === 'Bersama').length;

                        const displayedTasks = activitiesPicFilter === 'ALL'
                          ? currentCatTasks
                          : activitiesPicFilter === 'Bersama'
                            ? currentCatTasks.filter(t => (t.pic || 'Bersama') === 'Bersama')
                            : currentCatTasks.filter(t => t.pic === activitiesPicFilter);

                        return (
                          <>
                            {/* PIC Filter Pills */}
                            {currentCatTasks.length > 0 && (
                              <div className="pic-filter-pills">
                                <button
                                  type="button"
                                  className={`pic-filter-btn ${activitiesPicFilter === 'ALL' ? 'active' : ''}`}
                                  onClick={() => {
                                    setActivitiesPicFilter('ALL');
                                    showDemoFeedback("Filter PIC Semua: Melihat seluruh daftar tugas kategori ini.");
                                  }}
                                >
                                  <span>Semua</span>
                                  <span className="pic-filter-count">{countAll}</span>
                                </button>
                                <button
                                  type="button"
                                  className={`pic-filter-btn pic-cpp ${activitiesPicFilter === 'CPP' ? 'active' : ''}`}
                                  onClick={() => {
                                    setActivitiesPicFilter('CPP');
                                    showDemoFeedback("Filter PIC Dhova: Menampilkan tugas khusus calon mempelai pria.");
                                  }}
                                >
                                  <span>Tugas Dhova</span>
                                  <span className="pic-filter-count">{countCpp}</span>
                                </button>
                                <button
                                  type="button"
                                  className={`pic-filter-btn pic-cpw ${activitiesPicFilter === 'CPW' ? 'active' : ''}`}
                                  onClick={() => {
                                    setActivitiesPicFilter('CPW');
                                    showDemoFeedback("Filter PIC Maipa: Menampilkan tugas khusus calon mempelai wanita.");
                                  }}
                                >
                                  <span>Tugas Maipa</span>
                                  <span className="pic-filter-count">{countCpw}</span>
                                </button>
                                <button
                                  type="button"
                                  className={`pic-filter-btn pic-bersama ${activitiesPicFilter === 'Bersama' ? 'active' : ''}`}
                                  onClick={() => {
                                    setActivitiesPicFilter('Bersama');
                                    showDemoFeedback("Filter PIC Bersama: Menampilkan tugas yang diselesaikan berdua.");
                                  }}
                                >
                                  <span>Tugas Bersama</span>
                                  <span className="pic-filter-count">{countBersama}</span>
                                </button>
                              </div>
                            )}

                            {/* Empty PIC Filter State */}
                            {currentCatTasks.length > 0 && displayedTasks.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '30px 15px', background: 'var(--color-background)', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                                  Tidak ada tugas untuk {activitiesPicFilter === 'CPP' ? 'Tugas Dhova' : activitiesPicFilter === 'CPW' ? 'Tugas Maipa' : 'Tugas Bersama'} di kategori ini.
                                </p>
                                <button
                                  type="button"
                                  className="plan-tab-item active"
                                  onClick={() => setActivitiesPicFilter('ALL')}
                                  style={{ marginTop: '10px' }}
                                >
                                  Tampilkan Semua Tugas
                                </button>
                              </div>
                            )}

                            {/* Task Items List */}
                            {displayedTasks.length > 0 && (
                              <ul className="task-list-details">
                                {displayedTasks.map(task => (
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
                                          {task.due_date && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                              <Calendar size={12} /> {task.due_date}
                                            </span>
                                          )}
                                          <span className={`task-pic-badge pic-${(task.pic || 'Bersama').toLowerCase()}`}>
                                            {task.pic === 'CPP' ? 'Tugas Dhova' : task.pic === 'CPW' ? 'Tugas Maipa' : 'Tugas Bersama'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-muted)' }}>
                                      <Edit2
                                        size={15}
                                        style={{ cursor: 'pointer' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openDemoCtaModal({
                                            title: 'Edit Rincian Tugas',
                                            subtitle: 'Ubah tenggat waktu kalender, deskripsi tugas, dan PIC bersama calon pasangan di Amara versi penuh.',
                                            icon: 'tasks'
                                          });
                                        }}
                                      />
                                      <Trash2
                                        size={15}
                                        style={{ cursor: 'pointer', color: 'var(--color-danger, #EF4444)' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openDemoCtaModal({
                                            title: 'Hapus Tugas',
                                            subtitle: 'Kelola dan rapikan tugas persiapan pernikahanmu dengan bebas di Amara.',
                                            icon: 'tasks'
                                          });
                                        }}
                                      />
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Empty Category State with Magic Template */}
                            {currentCatTasks.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', borderRadius: '14px', border: '1px dashed var(--color-border)', marginBottom: '16px' }}>
                                <Wand2 size={40} style={{ color: 'var(--color-primary)', opacity: 0.8, marginBottom: '12px' }} />
                                <h4 style={{ color: 'var(--color-text)', marginBottom: '6px', fontSize: '1.05rem', fontWeight: 700 }}>
                                  Belum Ada Tugas di {activitiesCategory}
                                </h4>
                                <p style={{ marginBottom: '18px', fontSize: '0.84rem' }}>
                                  Ingin rekomendasi tugas otomatis dari checklist cerdas Amara?
                                </p>
                                <button
                                  type="button"
                                  className="btn-magic-template"
                                  onClick={() => {
                                    const newTemplateTasks = [
                                      { id: `gen-${Date.now()}-1`, category: activitiesCategory, title: `Riset & seleksi vendor ${activitiesCategory}`, due_date: '15/10/2026', pic: 'Bersama', is_completed: false },
                                      { id: `gen-${Date.now()}-2`, category: activitiesCategory, title: `Meeting & negosiasi paket terbaik`, due_date: '25/10/2026', pic: 'CPP', is_completed: false },
                                      { id: `gen-${Date.now()}-3`, category: activitiesCategory, title: `Finalisasi kontrak & pelunasan DP`, due_date: '05/11/2026', pic: 'Bersama', is_completed: false }
                                    ];
                                    setActivitiesTasks(prev => [...prev, ...newTemplateTasks]);
                                    showDemoFeedback(`✨ Magic Template aktif! 3 tugas rekomendasi untuk ${activitiesCategory} berhasil ditambahkan.`);
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', borderRadius: '30px', background: 'var(--color-primary)', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(153, 24, 42, 0.25)' }}
                                >
                                  <Wand2 size={16} /> Gunakan Magic Template
                                </button>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                              <button
                                type="button"
                                className="btn-add-task-real"
                                style={{ flex: 1 }}
                                onClick={() => openDemoCtaModal({
                                  title: 'Tambah Tugas Pernikahan Custom',
                                  subtitle: 'Di versi penuh Amara, kamu dan pasangan bebas menambahkan tugas baru tanpa batas, mengatur deadline kalender, dan menentukan penanggung jawab (CPP/CPW) dengan notifikasi.',
                                  icon: 'tasks'
                                })}
                              >
                                + Tambah Tugas
                              </button>
                              {currentCatTasks.length > 0 && (
                                <button
                                  type="button"
                                  className="btn-magic-template-outline"
                                  onClick={() => openDemoCtaModal({
                                    title: 'Magic Template Cerdas',
                                    subtitle: 'Gunakan ratusan template tugas kurasi para wedding planner berpengalaman langsung ke akunmu dalam 1 klik.',
                                    icon: 'tasks'
                                  })}
                                >
                                  <Wand2 size={15} /> Magic Template
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
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
                            <button 
                              type="button" 
                              className="btn-atur-target"
                              onClick={() => openDemoCtaModal({
                                title: 'Atur Target Anggaran Maksimal',
                                subtitle: 'Tentukan pagu budget impianmu. Amara otomatis menghitung estimasi biaya riil, sisa dana, dan memberi alert sebelum anggaran over-budget.',
                                icon: 'budget'
                              })}
                            >
                              ATUR TARGET <Edit3 size={11} style={{ marginLeft: '4px' }} />
                            </button>
                          </div>
                          <h2 className="target-card-amount">Rp 50.000.000</h2>
                          <div className="target-progress-bg">
                            <div className="target-progress-fill" style={{ width: '22%' }}></div>
                          </div>
                          <div className="target-progress-labels">
                            <span>22% TERPAKAI</span>
                            <span>Rp 11.000.000 / 50jt</span>
                          </div>
                        </div>

                        <div className="estimasi-biaya-card">
                          <div className="estimasi-card-header">
                            <span className="estimasi-card-label">ESTIMASI BIAYA ({budgetActivePlan})</span>
                            <span className="estimasi-badge safe">SISA Rp 39.000.000</span>
                          </div>
                          <h2 className="estimasi-card-amount">Rp 11.000.000</h2>
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
                            onClick={() => {
                              setBudgetActivePlan('Plan B');
                              showDemoFeedback("Skenario Plan B: Bandingkan opsi konsep pernikahan dengan estimasi biaya berbeda.");
                            }}
                          >
                            Plan B (Grand Ballroom)
                          </button>
                          <button 
                            type="button" 
                            className="plan-tab-item" 
                            onClick={() => openDemoCtaModal({
                              title: 'Simulasi Multi-Plan Anggaran',
                              subtitle: 'Bandingkan berbagai skenario pernikahan (Plan Gedung vs Plan Garden Party) untuk menentukan keputusan finansial terbaik bersama pasangan.',
                              icon: 'budget'
                            })}
                          >
                            +
                          </button>

                          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                            <button type="button" className="plan-tab-item" title="Duplikasi Plan" onClick={() => openDemoCtaModal({ title: 'Duplikasi Skenario Plan', subtitle: 'Salin seluruh rincian anggaran ke skenario baru dalam 1 klik untuk simulasi alternatif vendor.', icon: 'budget' })}><Copy size={13} /></button>
                            <button type="button" className="plan-tab-item" title="Ubah Nama Plan" onClick={() => openDemoCtaModal({ title: 'Kustom Nama Plan', subtitle: 'Beri nama khusus untuk setiap skenario rencana pernikahanmu.', icon: 'budget' })}><Edit2 size={13} /></button>
                            <button type="button" className="plan-tab-item" title="Komparasi Skenario" onClick={() => openDemoCtaModal({ title: 'Bandingkan Antar Plan', subtitle: 'Lihat perbandingan selisih biaya antar skenario secara visual.', icon: 'budget' })}><BarChart2 size={13} /></button>
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
                                    <Trash2 size={14} style={{ color: 'var(--color-danger, #EF4444)', cursor: 'pointer' }} onClick={() => openDemoCtaModal({ title: 'Hapus Item Anggaran', subtitle: 'Atur pos-pos pengeluaran pernikahanmu dengan leluasa.', icon: 'budget' })} />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <button
                          type="button"
                          className="btn-add-task-real"
                          style={{ marginTop: '16px' }}
                          onClick={() => openDemoCtaModal({
                            title: 'Catat Pengeluaran & Termin Vendor',
                            subtitle: 'Input biaya vendor baru, catat nomor rekening pembayaran, dan pantau bukti transfer pembayaran tanpa catatan tercecer.',
                            icon: 'budget'
                          })}
                        >
                          + Tambah Pengeluaran
                        </button>
                      </div>
                    </>
                  )}

                  {/* Sub-view 2: DANA NIKAH */}
                  {budgetSubTab === 'dana-nikah' && (
                    <div className="dana-nikah-section-content">
                      {/* Top Summary Cards Grid */}
                      <div className="dana-nikah-cards-grid">
                        {/* Main Dark Red Card */}
                        <div
                          className="dana-nikah-main-card"
                          onClick={() => openDemoCtaModal({
                            title: 'Atur Target Tabungan Dana Nikah',
                            subtitle: 'Tentukan target total dana terkumpul berdua. Amara otomatis menghitung persentase capaian, rata-rata bulanan, dan rekomendasi menabung hingga hari-H.',
                            icon: 'budget'
                          })}
                        >
                          <div className="dana-card-top">
                            <span className="dana-card-label">DANA TERKUMPUL</span>
                            <button
                              type="button"
                              className="btn-atur-target"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDemoCtaModal({
                                  title: 'Ubah Target Dana Nikah',
                                  subtitle: 'Atur nominal target dana nikah dan tenggat waktu terkumpul agar perencanaan tabungan berdua tetap terarah.',
                                  icon: 'budget'
                                });
                              }}
                            >
                              ATUR TARGET <Edit3 size={12} />
                            </button>
                          </div>

                          <h2 className="dana-card-amount">Rp 17.000.000</h2>

                          {/* Progress Bar */}
                          <div className="dana-progress-container">
                            <div className="dana-progress-bg">
                              <div className="dana-progress-fill" style={{ width: '34%' }}></div>
                            </div>
                            <div className="dana-progress-labels">
                              <span>34% TERCAPAI</span>
                              <span>TARGET Rp 50.000.000</span>
                            </div>
                          </div>

                          {/* Deadline Badge */}
                          <div className="dana-deadline-row">
                            <span className="dana-deadline-tag">
                              <Calendar size={12} />
                              <span>Target Terkumpul: 12 Des 2026 (72 hari lagi)</span>
                            </span>
                          </div>
                        </div>

                        {/* Right Side Stats Column */}
                        <div className="dana-nikah-side-stats">
                          <div className="dana-side-card">
                            <span className="side-card-label">RATA-RATA PER BULAN</span>
                            <p className="side-card-value" style={{ color: '#16a34a', fontWeight: 800 }}>
                              Rp 8.500.000
                            </p>
                          </div>

                          <div className="dana-side-card">
                            <span className="side-card-label">REKOMENDASI PER BULAN</span>
                            <p className="side-card-value text-primary" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                              Rp 11.000.000
                            </p>
                            <span className="side-card-deadline-hint">
                              s/d 12 Des 2026
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section Riwayat Tabungan */}
                      <div className="riwayat-tabungan-section">
                        <div className="riwayat-header">
                          <h2>RIWAYAT TABUNGAN</h2>
                          <button
                            type="button"
                            className="btn-tambah-tabungan"
                            onClick={() => openDemoCtaModal({
                              title: 'Catat Setoran Tabungan Bersama',
                              subtitle: 'Catat setiap pemasukan tabungan (gaji bulanan CPP, tabungan CPW, bonus) agar saldo terkumpul selalu terupdate secara transparan.',
                              icon: 'budget'
                            })}
                          >
                            + TAMBAH
                          </button>
                        </div>

                        {/* List of Savings Entries */}
                        <div className="riwayat-list">
                          {demoSavings.map(item => (
                            <div key={item.id} className="riwayat-item-card">
                              <div className="riwayat-item-left">
                                <h4 className="riwayat-item-title">{item.title}</h4>
                                <span className="riwayat-item-date">{item.date}</span>
                              </div>

                              <div className="riwayat-item-right">
                                <span className="riwayat-item-amount">+ {formatCurrency(item.amount)}</span>
                                <div className="riwayat-actions">
                                  <button
                                    type="button"
                                    className="btn-icon-action"
                                    onClick={() => openDemoCtaModal({
                                      title: 'Edit Riwayat Tabungan',
                                      subtitle: 'Koreksi tanggal atau nominal tabungan pernikahan kapan pun dibutuhkan.',
                                      icon: 'budget'
                                    })}
                                    title="Edit Tabungan"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-icon-action"
                                    style={{ color: 'var(--color-danger, #EF4444)' }}
                                    onClick={() => openDemoCtaModal({
                                      title: 'Hapus Entri Tabungan',
                                      subtitle: 'Kelola catatan tabungan bersama dengan kontrol penuh.',
                                      icon: 'budget'
                                    })}
                                    title="Hapus Tabungan"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-view 3: PEMBAYARAN */}
                  {budgetSubTab === 'pembayaran' && (
                    <div className="pembayaran-section-content">
                      {/* Top Summary Matrix */}
                      <div className="budget-matrix">
                        <div className="matrix-primary">
                          <div
                            className="matrix-card total-budget-card"
                            onClick={() => openDemoCtaModal({
                              title: 'Atur Total Budget',
                              subtitle: 'Tetapkan batas pagu maksimal budget pernikahan agar pengeluaran terkendali.',
                              icon: 'budget'
                            })}
                          >
                            <div className="card-header">
                              <h3>TOTAL BUDGET</h3>
                              <Edit3 size={15} opacity={0.8} />
                            </div>
                            <p className="amount">Rp 50.000.000</p>
                          </div>

                          <div className="matrix-card sisa-budget-card">
                            <div className="card-header">
                              <h3>SISA BUDGET</h3>
                            </div>
                            <p className="amount" style={{ color: 'var(--color-primary)' }}>
                              Rp 44.500.000
                            </p>
                          </div>
                        </div>

                        <div className="matrix-secondary">
                          <div className="matrix-card dibayar-card">
                            <h3>PEMBAYARAN SELESAI</h3>
                            <p className="amount-small" style={{ color: '#059669' }}>Rp 5.500.000</p>
                          </div>
                          <div className="matrix-card sisa-bayar-card">
                            <h3>SISA PEMBAYARAN</h3>
                            <p className="amount-small" style={{ color: '#D97706' }}>Rp 5.500.000</p>
                          </div>
                        </div>
                      </div>

                      {/* Budget Health Progress Bar */}
                      <div className="budget-health-section">
                        <div className="health-header">
                          <h4>Kesehatan Anggaran</h4>
                          <span className="health-badge" style={{ backgroundColor: '#10B981', color: '#ffffff' }}>
                            Sangat Baik (Aman)
                          </span>
                        </div>
                        <div className="health-bar-bg">
                          <div
                            className="health-bar-fill"
                            style={{ width: '100%', backgroundColor: '#10B981' }}
                          ></div>
                        </div>
                      </div>

                      {/* Desktop Table Section */}
                      <div className="budget-table-card" style={{ padding: 0 }}>
                        <div className="table-toolbar">
                          <div className="table-toolbar-left">
                            <button
                              type="button"
                              className={`filter-pill ${paymentStatusFilter === 'all' ? 'active' : ''}`}
                              onClick={() => setPaymentStatusFilter('all')}
                            >
                              Semua
                            </button>
                            <button
                              type="button"
                              className={`filter-pill ${paymentStatusFilter === 'belum-bayar' ? 'active' : ''}`}
                              onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'belum-bayar' ? 'all' : 'belum-bayar')}
                            >
                              Belum Bayar
                            </button>
                            <button
                              type="button"
                              className={`filter-pill ${paymentStatusFilter === 'cicilan' ? 'active' : ''}`}
                              onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'cicilan' ? 'all' : 'cicilan')}
                            >
                              Cicilan
                            </button>
                            <button
                              type="button"
                              className={`filter-pill ${paymentStatusFilter === 'lunas' ? 'active' : ''}`}
                              onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'lunas' ? 'all' : 'lunas')}
                            >
                              Lunas
                            </button>
                            <span className="table-toolbar-divider" />
                            <button
                              type="button"
                              className="import-plan-btn"
                              onClick={() => openDemoCtaModal({
                                title: 'Salin dari Rencana Budget',
                                subtitle: 'Otomatis pindahkan daftar kebutuhan yang sudah kamu rencanakan di tab Budgeting langsung ke tabel Pembayaran vendor tanpa mengetik ulang.',
                                icon: 'budget'
                              })}
                            >
                              <Copy size={13} />
                              <span>Salin dari Rencana Budget</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface-solid)', padding: '6px 14px', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--color-border)', width: '240px' }}>
                            <Search size={14} className="icon-muted" />
                            <input
                              type="text"
                              placeholder="Cari kebutuhan..."
                              value={paymentSearch}
                              onChange={(e) => setPaymentSearch(e.target.value)}
                              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', width: '100%', color: 'var(--color-text)' }}
                            />
                          </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table className="real-budget-table">
                            <thead>
                              <tr>
                                <th style={{ width: '22%' }}>KEBUTUHAN</th>
                                <th style={{ width: '16%' }}>VENDOR</th>
                                <th style={{ width: '14%' }}>AKTUAL</th>
                                <th style={{ width: '14%' }}>DIBAYAR</th>
                                <th style={{ width: '14%' }}>SISA</th>
                                <th style={{ width: '10%' }}>DEADLINE</th>
                                <th style={{ width: '10%' }}>STATUS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentItems
                                .filter(item => paymentStatusFilter === 'all' || item.status === paymentStatusFilter)
                                .filter(item => !paymentSearch || item.item.toLowerCase().includes(paymentSearch.toLowerCase()) || item.vendor.toLowerCase().includes(paymentSearch.toLowerCase()))
                                .map(item => (
                                  <tr key={item.id}>
                                    <td><strong>{item.item}</strong></td>
                                    <td><span style={{ color: 'var(--color-text-muted)' }}>{item.vendor}</span></td>
                                    <td><strong>{formatCurrency(item.actual)}</strong></td>
                                    <td style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(item.paid)}</td>
                                    <td style={{ color: item.sisa === 0 ? 'var(--color-text-muted)' : '#D97706', fontWeight: 700 }}>{formatCurrency(item.sisa)}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.deadline}</td>
                                    <td>
                                      <span className={`status-pill ${item.status}`}>
                                        {item.status === 'lunas' ? 'Lunas' : item.status === 'cicilan' ? 'Cicilan' : 'Belum Bayar'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
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
                        <button 
                          type="button" 
                          className="btn-tambah-seserahan" 
                          onClick={() => openDemoCtaModal({
                            title: 'Tambah Item Seserahan Impian',
                            subtitle: 'Di versi penuh Amara, kamu bisa mengelola daftar seserahan adat maupun modern secara lengkap dengan estimasi harga dan pembagian kotak seserahan.',
                            icon: 'seserahan'
                          })}
                        >
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
                    <button 
                      type="button" 
                      className="btn-add-task-real" 
                      style={{ width: 'auto', background: 'var(--color-primary)', color: '#ffffff', border: 'none' }} 
                      onClick={() => openDemoCtaModal({
                        title: 'Simpan & Bandingkan Vendor Bebas Batas',
                        subtitle: 'Catat vendor pilihan, kontak WhatsApp PIC, harga penawaran, dan bandingkan vendor terbaik tanpa catatan tercecer.',
                        icon: 'vendor'
                      })}
                    >
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

                  {/* Vendor Cards Grid - 100% Matching Real Amara */}
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
                          <div className="vendor-card-banner">
                            <button
                              type="button"
                              className={`vendor-heart-overlay ${vendor.is_favorite ? 'is-fav' : ''}`}
                              onClick={() => toggleVendorFav(vendor.id)}
                              title="Favorit"
                            >
                              <Heart size={18} fill={vendor.is_favorite ? '#EF4444' : 'none'} color={vendor.is_favorite ? '#EF4444' : '#ffffff'} />
                            </button>
                            <div className="vendor-avatar-circle-real">
                              {vendor.name.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="vendor-card-body">
                            <h3 className="real-vendor-name">{vendor.name}</h3>
                            <div className="real-vendor-meta">
                              <span className="vendor-category-chip">{vendor.category}</span>
                              <span className="vendor-rating-chip"><Star size={13} fill="#D97706" color="#D97706" /> {vendor.rating}</span>
                              <div className="vendor-social-icons">
                                <span className="vendor-social-icon" title="Instagram"><InstagramIcon size={14} /></span>
                                <span className="vendor-social-icon" title="Website"><ExternalLink size={14} /></span>
                              </div>
                            </div>
                            <div className="vendor-detail-section">
                              <strong>DETAIL PAKET:</strong>
                              <p>{vendor.description}</p>
                            </div>
                            <div className="vendor-note-section">
                              <strong>CATATAN TAMBAHAN:</strong>
                              <p>{vendor.note}</p>
                            </div>
                            <div className="vendor-contact-section">
                              <strong>Kontak / PIC:</strong>
                              <div className="vendor-contact-info">
                                <span className="vendor-contact-name">
                                  <User size={13} /> {vendor.contact_name}
                                </span>
                                <a
                                  href={`https://wa.me/62${vendor.contact_phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="vendor-phone-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <PhoneCall size={11} /> {vendor.contact_phone}
                                </a>
                              </div>
                            </div>
                            <div className="vendor-price-display">{vendor.price}</div>
                            <button
                              type="button"
                              className={`btn-choose-vendor ${vendor.is_chosen ? 'is-chosen' : ''}`}
                              onClick={() => toggleVendorChosen(vendor.id)}
                            >
                              {vendor.is_chosen ? (<><Check size={14} /> Terpilih</>) : ('+ Pilih Vendor Ini')}
                            </button>
                          </div>
                          <div className="vendor-card-footer-actions">
                            <button type="button" className="vendor-action-btn"><Edit2 size={13} /> Ubah</button>
                            <button type="button" className="vendor-action-btn danger"><Trash2 size={13} /> Hapus</button>
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
                        onClick={() => openDemoCtaModal({
                          title: 'Import Tamu Sekaligus via Excel / CSV',
                          subtitle: 'Punya ratusan daftar tamu di Excel? Cukup upload filemu, Amara akan otomatis mengorganisir tamu per kategori dan jumlah pax.',
                          icon: 'guests'
                        })}
                      >
                        <Upload size={14} /> Unggah Tamu
                      </button>
                      <button
                        type="button"
                        className="btn-add-task-real"
                        style={{ width: 'auto', background: 'var(--color-primary)', color: '#ffffff', border: 'none' }}
                        onClick={() => openDemoCtaModal({
                          title: 'Kelola Daftar Tamu & WhatsApp RSVP',
                          subtitle: 'Input tamu undangan baru, atur jumlah pax, bedakan kategori VIP/Keluarga, dan kirim pesan RSVP via WhatsApp personal langsung dalam 1 klik.',
                          icon: 'guests'
                        })}
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
                        { id: 'cpp', label: 'Tamu CPP' },
                        { id: 'cpw', label: 'Tamu CPW' },
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
                            if (guestFilter === 'cpp') return (g.category || '').includes('CPP');
                            if (guestFilter === 'cpw') return (g.category || '').includes('CPW');
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

          {/* Floating Micro-Feedback Helper */}
          {demoFeedback && (
            <div className="preview-floating-helper">
              <div className="pfh-icon-glow">
                <Sparkles size={16} />
              </div>
              <div className="pfh-content">
                <span className="pfh-badge">TRIAL INTERAKTIF AMARA</span>
                <p className="pfh-text">{demoFeedback}</p>
              </div>
              <div className="pfh-actions">
                <button
                  type="button"
                  className="pfh-cta-btn"
                  onClick={() => {
                    openDemoCtaModal({
                      title: 'Dapatkan Akses Amara Penuh',
                      subtitle: 'Nikmati kemudahan mengelola seluruh persiapan pernikahan bersama pasangan dengan sinkronisasi realtime, 360+ checklist kurasi, dan akses seumur hidup.',
                      icon: 'crown'
                    });
                  }}
                >
                  <span>Buka Akses</span>
                  <ExternalLink size={12} />
                </button>
                <button
                  type="button"
                  className="pfh-close-btn"
                  onClick={() => setDemoFeedback(null)}
                  title="Tutup pesan"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
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
              src="/devices-mockup.png?v=hd-v2"
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

      {/* Friendly Trial Conversion Gatekeeper Modal */}
      {demoCtaModal && (
        <div className="demo-cta-modal-overlay" onClick={() => setDemoCtaModal(null)}>
          <div className="demo-cta-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="demo-cta-modal-close"
              onClick={() => setDemoCtaModal(null)}
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>

            <div className="demo-cta-modal-header">
              <div className="demo-cta-modal-badge-icon">
                {demoCtaModal.icon === 'crown' && <Crown size={30} color="#f59e0b" />}
                {demoCtaModal.icon === 'tasks' && <CheckSquare size={30} color="#e11d48" />}
                {demoCtaModal.icon === 'budget' && <DollarSign size={30} color="#10b981" />}
                {demoCtaModal.icon === 'seserahan' && <Gift size={30} color="#ec4899" />}
                {demoCtaModal.icon === 'vendor' && <Briefcase size={30} color="#8b5cf6" />}
                {demoCtaModal.icon === 'guests' && <UserPlus size={30} color="#3b82f6" />}
                {demoCtaModal.icon === 'users' && <Users size={30} color="#f59e0b" />}
              </div>
              <span className="demo-cta-modal-tag">AKSES PENUH AMARA WEDDING</span>
              <h3 className="demo-cta-modal-title">{demoCtaModal.title}</h3>
              <p className="demo-cta-modal-subtitle">{demoCtaModal.subtitle}</p>
            </div>

            <div className="demo-cta-modal-perks">
              <div className="demo-perk-item">
                <CheckCircle size={16} className="perk-check-icon" />
                <span><strong>2 Akun Terhubung:</strong> Kamu & pasangan login bersamaan secara realtime tanpa repot tukar password.</span>
              </div>
              <div className="demo-perk-item">
                <CheckCircle size={16} className="perk-check-icon" />
                <span><strong>Sekali Bayar Selamanya:</strong> Hanya <strong>Rp 105.000,-</strong> (Diskon 79% dari Rp 499.000,-) tanpa langganan.</span>
              </div>
              <div className="demo-perk-item">
                <CheckCircle size={16} className="perk-check-icon" />
                <span><strong>Multi-Device:</strong> Akses fleksibel via HP, Tablet, & Laptop kapan saja di mana saja.</span>
              </div>
            </div>

            <div className="demo-cta-modal-footer">
              <button
                type="button"
                className="demo-cta-modal-btn-primary"
                onClick={() => {
                  setDemoCtaModal(null);
                  handlePurchaseAccess();
                }}
              >
                <span>Dapatkan Akses Amara Sekarang</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="demo-cta-modal-btn-secondary"
                onClick={() => {
                  setDemoCtaModal(null);
                  scrollToSection('paket');
                }}
              >
                Lihat Paket & Semua Fitur Amara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
