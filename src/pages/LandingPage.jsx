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
} from 'lucide-react';
import '../styles/LandingPage.css';

const LYNK_PURCHASE_URL = 'https://lynk.id/disfera/p98eoy74rwkw';

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
            {/* OVERVIEW TAB */}
            {activePreviewTab === 'overview' && (
              <div>
                <div className="mock-header-row">
                  <div className="mock-couple-title">
                    <h3>Dhova & Maipa Wedding</h3>
                    <p>Sabtu, 24 Oktober 2026 • Gedung Sasana Kriya, Jakarta</p>
                  </div>
                  <div className="mock-countdown-badge">
                    <Clock size={16} />
                    <span>H - 128 Hari</span>
                  </div>
                </div>

                <div className="mock-overview-grid">
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Progress Persiapan</div>
                    <div className="mock-metric-value">72%</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Total Pengeluaran</div>
                    <div className="mock-metric-value">Rp 85.500.000</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '65%', background: '#10b981' }} />
                    </div>
                  </div>
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Estimasi Tamu Hadir</div>
                    <div className="mock-metric-value">340 Pax</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '85%', background: '#3b82f6' }} />
                    </div>
                  </div>
                </div>

                <div className="mock-list-container">
                  <div className="mock-list-title">
                    <span>Panduan Tugas Mendatang (Mendesak)</span>
                    <span className="mock-link-text">Lihat Semua</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check done"><Check size={12} /></div>
                      <span>Fitting Baju Pengantin Akad (MUA & Attire)</span>
                    </div>
                    <span className="mock-tag mock-tag-cpw">PIC: CPW</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check" />
                      <span>Pembayaran DP 50% Catering Wedding</span>
                    </div>
                    <span className="mock-tag mock-tag-cpp">PIC: CPP</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check" />
                      <span>Finalisasi Design Undangan & Cetak</span>
                    </div>
                    <span className="mock-tag mock-tag-together">PIC: Bersama</span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITIES TAB */}
            {activePreviewTab === 'activities' && (
              <div>
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Panduan Checklist & Rundown Acara</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>42 Tugas Selesai dari Total 58 Tugas</p>
                  </div>
                  <span className="mock-tag mock-tag-together">Semua PIC</span>
                </div>
                <div className="mock-list-container">
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check done"><Check size={12} /></div>
                      <div>
                        <strong>Survey Venue & Booking Tanggal</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Fase H-180 Hari</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-together">Selesai</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check done"><Check size={12} /></div>
                      <div>
                        <strong>Pengurusan Berkas KUA & Numpang Nikah</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Fase H-90 Hari</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpp">Selesai</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check" />
                      <div>
                        <strong>Meeting Technical dengan WO & Decorator</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Fase H-30 Hari</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpw">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* BUDGET TAB */}
            {activePreviewTab === 'budget' && (
              <div>
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Asisten Pengawasan Budget Pernikahan</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Target Budget: Rp 120.000.000</p>
                  </div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>Sisa Saldo: Rp 34.500.000</div>
                </div>
                <div className="mock-overview-grid">
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Catering & Food</div>
                    <div className="mock-metric-value">Rp 45.000.000</div>
                    <span className="mock-tag mock-tag-together">Terbayar Lunas</span>
                  </div>
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Venue & Sewa Gedung</div>
                    <div className="mock-metric-value">Rp 25.000.000</div>
                    <span className="mock-tag mock-tag-cpp">DP 50% Paid</span>
                  </div>
                  <div className="mock-metric-card">
                    <div className="mock-metric-label">MUA & Busana</div>
                    <div className="mock-metric-value">Rp 15.500.000</div>
                    <span className="mock-tag mock-tag-cpw">DP 30% Paid</span>
                  </div>
                </div>
              </div>
            )}

            {/* SESERAHAN TAB */}
            {activePreviewTab === 'seserahan' && (
              <div>
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Pelacak Kelengkapan Seserahan</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>8 Kotak Seserahan • 24 Item Barang</p>
                  </div>
                  <span className="mock-tag mock-tag-cpw">85% Lengkap</span>
                </div>
                <div className="mock-list-container">
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <Gift size={16} color="var(--color-primary)" />
                      <div>
                        <strong>Box 1: Perlengkapan Ibadah (Mukena & Al-Qur'an)</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Status: Sudah dihias dalam box acrylic</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-together">Siap</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <Gift size={16} color="var(--color-primary)" />
                      <div>
                        <strong>Box 2: Skincare & Perfume Set</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Status: Barang dibeli, proses hias</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpw">In Progress</span>
                  </div>
                </div>
              </div>
            )}

            {/* GUESTS TAB */}
            {activePreviewTab === 'guests' && (
              <div>
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Daftar Tamu & Rekap Amplop Digital</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Tamu Undangan: 200 Undangan (380 Pax)</p>
                  </div>
                  <span className="mock-tag mock-tag-together">RSVP Active</span>
                </div>
                <div className="mock-list-container">
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="author-avatar-dummy" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>RK</div>
                      <div>
                        <strong>Rian & Partner (Keluarga Besar)</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>VIP • Konfirmasi Hadir (2 Pax)</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpp">Hadir</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="author-avatar-dummy" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>DS</div>
                      <div>
                        <strong>Dina & Suami (Teman CPW)</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Reguler • Konfirmasi Hadir (2 Pax)</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpw">Hadir</span>
                  </div>
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
                <span>Mulai Bagi Tugas Bersama Pasangan →</span>
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
              <span className="mission-social-label">Ikuti perjalanan kami di TikTok & Instagram:</span>
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
