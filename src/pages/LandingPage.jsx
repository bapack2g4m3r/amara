import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Calendar,
  DollarSign,
  Gift,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Smartphone,
  Zap,
  Lock,
  UserPlus,
  LogIn,
  Menu,
  X,
  Clock,
  Star,
  Check,
  HelpCircle,
  Briefcase,
  Layers,
  PieChart,
  Crown,
  Key
} from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
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
      <div className="landing-bg-glow"></div>

      {/* HEADER / NAVBAR */}
      <header className="landing-header">
        <nav className="landing-nav">
          <a href="#" className="landing-brand">
            <img src="/amara-logo.png" alt="Amara Wedding Companion" className="landing-logo-img" />
          </a>

          <div className={`landing-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button className="landing-nav-link" onClick={() => scrollToSection('preview')}>
              Demo Companion
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('fitur')}>
              Fitur Utama
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('kolaborasi')}>
              Kolaborasi Pasangan
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('paket')}>
              Paket Akses
            </button>
            <button className="landing-nav-link" onClick={() => scrollToSection('faq')}>
              FAQ
            </button>
          </div>

          <div className="landing-nav-actions">
            <button
              className="btn-primary-outline"
              onClick={() => navigate('/login?mode=login')}
              style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            >
              Masuk
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/login?mode=signup')}
              style={{ padding: '8px 22px', fontSize: '0.88rem' }}
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

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Digital Wedding Companion #1 untuk Pasangan Impian</span>
        </div>

        <h1 className="hero-title">
          Pendamping Digital Terbaik dalam <br />
          <span className="hero-title-highlight">Setiap Langkah Pernikahanmu</span>
        </h1>

        <p className="hero-subtitle">
          Amara bukan sekadar planner biasa—kami adalah <strong>Wedding Companion</strong> yang hadir mendampingi
          Anda & pasangan dari hari pertama perencanaan, pembagian tugas romantis, pengawasan anggaran,
          hingga momentum indah di Hari-H.
        </p>

        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={() => navigate('/login?mode=signup')}>
            <span>Dapatkan Akses Amara</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-hero-secondary" onClick={() => scrollToSection('preview')}>
            <span>Lihat Demo Companion</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <Heart size={22} />
            </div>
            <div>
              <div className="hero-stat-title">Teman Setia Pasangan</div>
              <div className="hero-stat-desc">Satu dashboard synchronized CPP & CPW</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <PieChart size={22} />
            </div>
            <div>
              <div className="hero-stat-title">Financial Companion</div>
              <div className="hero-stat-desc">Kalkulator biaya & pelacak DP/Pelunasan</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="hero-stat-title">PWA Companion App</div>
              <div className="hero-stat-desc">Akses cepat di Laptop & Smartphone</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DASHBOARD PREVIEW */}
      <section className="preview-section" id="preview">
        <div className="section-header">
          <span className="section-tag">Interactive Showcase</span>
          <h2 className="section-title">Eksplorasi Tampilan Amara Companion</h2>
          <p className="section-subtitle">
            Rasakan bagaimana Amara mendampingi seluruh proses persiapan pernikahan Anda dalam satu layar interaktif.
          </p>
        </div>

        {/* Tabs */}
        <div className="preview-tabs">
          <button
            className={`preview-tab-btn ${activePreviewTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActivePreviewTab('overview')}
          >
            <Heart size={16} />
            <span>Overview Dashboard</span>
          </button>
          <button
            className={`preview-tab-btn ${activePreviewTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActivePreviewTab('activities')}
          >
            <CheckCircle2 size={16} />
            <span>Checklist & Rundown</span>
          </button>
          <button
            className={`preview-tab-btn ${activePreviewTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActivePreviewTab('budget')}
          >
            <DollarSign size={16} />
            <span>Anggaran & Biaya</span>
          </button>
          <button
            className={`preview-tab-btn ${activePreviewTab === 'seserahan' ? 'active' : ''}`}
            onClick={() => setActivePreviewTab('seserahan')}
          >
            <Gift size={16} />
            <span>Seserahan Tracker</span>
          </button>
          <button
            className={`preview-tab-btn ${activePreviewTab === 'guests' ? 'active' : ''}`}
            onClick={() => setActivePreviewTab('guests')}
          >
            <Users size={16} />
            <span>Daftar Tamu & RSVP</span>
          </button>
        </div>

        {/* Window Frame Mockup */}
        <div className="preview-window-frame">
          <div className="window-bar">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="window-address">app.amaraplanner.com/{activePreviewTab}</div>
            <div className="window-actions-dummy">
              <Zap size={15} />
            </div>
          </div>

          <div className="preview-canvas">
            {/* 1. OVERVIEW TAB MOCK */}
            {activePreviewTab === 'overview' && (
              <div>
                <div className="mock-header-row">
                  <div className="mock-couple-title">
                    <h3>Budi & Ani Wedding</h3>
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
                      <div className="mock-progress-bar-fill" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Total Pengeluaran</div>
                    <div className="mock-metric-value">Rp 85.500.000</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '65%', background: '#10b981' }}></div>
                    </div>
                  </div>

                  <div className="mock-metric-card">
                    <div className="mock-metric-label">Estimasi Tamu Hadir</div>
                    <div className="mock-metric-value">340 Pax</div>
                    <div className="mock-progress-bar-bg">
                      <div className="mock-progress-bar-fill" style={{ width: '85%', background: '#3b82f6' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mock-list-container">
                  <div className="mock-list-title">
                    <span>Panduan Tugas Mendatang (Mendesak)</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer' }}>Lihat Semua</span>
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
                      <div className="mock-item-check"></div>
                      <span>Pembayaran DP 50% Catering Wedding</span>
                    </div>
                    <span className="mock-tag mock-tag-cpp">PIC: CPP</span>
                  </div>
                  <div className="mock-list-item">
                    <div className="mock-item-info">
                      <div className="mock-item-check"></div>
                      <span>Finalisasi Design Undangan & Cetak</span>
                    </div>
                    <span className="mock-tag mock-tag-together">PIC: Bersama</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ACTIVITIES TAB MOCK */}
            {activePreviewTab === 'activities' && (
              <div>
                <div className="mock-header-row">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Panduan Checklist & Rundown Acara</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>42 Tugas Selesai dari Total 58 Tugas</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="mock-tag mock-tag-together">Semua PIC</span>
                  </div>
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
                      <div className="mock-item-check"></div>
                      <div>
                        <strong>Meeting Technical dengan Wo & Decorator</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Fase H-30 Hari</div>
                      </div>
                    </div>
                    <span className="mock-tag mock-tag-cpw">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BUDGET TAB MOCK */}
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

            {/* 4. SESERAHAN TAB MOCK */}
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

            {/* 5. GUESTS TAB MOCK */}
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

      {/* FEATURES SECTION */}
      <section className="features-section" id="fitur">
        <div className="section-header">
          <span className="section-tag">Fitur Companion</span>
          <h2 className="section-title">Solusi Lengkap Pendamping Pernikahan</h2>
          <p className="section-subtitle">
            Didesain khusus untuk memenuhi setiap tahapan persiapan pernikahan pasangan Indonesia.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Heart size={24} />
            </div>
            <h3 className="feature-title">Countdown & Navigasi Momen</h3>
            <p className="feature-desc">
              Lacak sisa hari pernikahan, persentase progress, & pengingat aktivitas paling mendesak.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <DollarSign size={24} />
            </div>
            <h3 className="feature-title">Financial Companion</h3>
            <p className="feature-desc">
              Kelola alokasi dana per kategori, catat DP & pelunasan vendor, serta dapatkan alert jika over-budget.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="feature-title">Checklist & Alignment PIC</h3>
            <p className="feature-desc">
              Pembagian tugas yang transparan antara CPP (Pria), CPW (Wanita), atau Bersama agar tidak ada miskomunikasi.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Gift size={24} />
            </div>
            <h3 className="feature-title">Seserahan Tracker</h3>
            <p className="feature-desc">
              Lacak setiap barang hantaran dari status pembelian, harga, hingga kesiapan penataan box.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={24} />
            </div>
            <h3 className="feature-title">Guest List & Rekap Amplop</h3>
            <p className="feature-desc">
              Kelola daftar tamu keluarga & teman, konfirmasi RSVP, serta pencatatan kado & amplop digital.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Briefcase size={24} />
            </div>
            <h3 className="feature-title">Direktori Vendor & Kontak</h3>
            <p className="feature-desc">
              Simpan daftar kontak vendor MUA, Catering, Foto, Dekorasi beserta status kontrak & pembayaran.
            </p>
          </div>
        </div>
      </section>

      {/* SINGLE PACKAGE PRICING SECTION */}
      <section className="pricing-section" id="paket">
        <div className="section-header">
          <span className="section-tag">Lisensi Pasangan</span>
          <h2 className="section-title">1 Paket Akses Lengkap untuk Berdua</h2>
          <p className="section-subtitle">
            Tanpa biaya tersembunyi, tanpa langganan bulanan. Dapatkan akses penuh ke seluruh fitur Amara.
          </p>
        </div>

        <div className="pricing-card-single">
          <div className="pricing-badge-top">All-In-One Pass</div>

          <h3 className="pricing-header-title">Paket Pasangan Amara Companion</h3>
          <p className="pricing-header-desc">
            Satu lisensi yang menghubungkan akun CPP & CPW secara real-time. Nikmati seluruh 6 modul Amara selamanya tanpa batasan.
          </p>

          <div className="pricing-price-tag-box">
            <div>
              <div className="pricing-main-label">Satu Paket Lengkap untuk Pasangan</div>
              <div className="pricing-sub-label">Akses Lifetime • Cukup Sekali Bayar untuk 2 Akun</div>
            </div>
            <button className="btn-hero-primary" onClick={() => navigate('/login?mode=signup')}>
              <span>Aktifkan Akses Amara</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="pricing-features-grid">
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>Akses 2 Akun Tersinkronisasi (CPP & CPW)</span>
            </div>
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>Akses Selamanya (Lifetime Access)</span>
            </div>
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>Seluruh 6 Modul Utama Lengkap</span>
            </div>
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>PWA Support (Laptop & Smartphone)</span>
            </div>
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>Tanpa Batasan Tamu & Catatan Biaya</span>
            </div>
            <div className="pricing-feature-item">
              <div className="pricing-check-icon"><Check size={14} /></div>
              <span>Gratis Update Fitur Terbaru Mendatang</span>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER COLLABORATION SPOTLIGHT */}
      <section className="partner-spotlight-section" id="kolaborasi">
        <div className="partner-card">
          <div className="partner-content">
            <h2>Satu Companion untuk Berdua</h2>
            <p>
              Tidak perlu lagi bingung saling kirim catatan manual atau lupa mana tugas yang sudah dikerjakan. 
              Undang pasanganmu & update secara real-time dari Smartphone masing-masing.
            </p>

            <div className="partner-bullets">
              <div className="partner-bullet-item">
                <div className="partner-bullet-icon"><Check size={14} /></div>
                <span>Sinkronisasi otomatis saat salah satu mengedit data</span>
              </div>
              <div className="partner-bullet-item">
                <div className="partner-bullet-icon"><Check size={14} /></div>
                <span>Tentukan PIC tugas (Calon Pria / Calon Wanita / Bersama)</span>
              </div>
              <div className="partner-bullet-item">
                <div className="partner-bullet-icon"><Check size={14} /></div>
                <span>Transparansi pengeluaran & anggaran pernikahan</span>
              </div>
            </div>

            <button className="btn-hero-primary" onClick={() => navigate('/login?mode=signup')}>
              <span>Hubungkan Akun Pasangan</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="partner-visual-card">
            <div className="partner-profile-pill">
              <div className="partner-name-group">
                <div className="partner-avatar">CP</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Calon Pengantin Pria</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online • Mengedit Biaya Catering</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 10 }}>Active</span>
            </div>

            <div className="partner-profile-pill">
              <div className="partner-name-group">
                <div className="partner-avatar" style={{ background: '#ec4899' }}>CW</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Calon Pengantin Wanita</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online • Menambahkan Box Seserahan</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 10 }}>Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="comparison-section">
        <div className="section-header">
          <span className="section-tag">Keunggulan Companion</span>
          <h2 className="section-title">Mengapa Wedding Companion, Bukan Sekadar Planner Biasa?</h2>
          <p className="section-subtitle">
            Banyak planner di luar sana hanya memberi daftar tugas statis. Amara hadir mendampingi perjalanan Anda & pasangan secara aktif.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card old-way">
            <div className="comparison-header">
              <X size={24} className="old-way-icon" />
              <span>Aplikasi Planner Biasa / Catatan Manual</span>
            </div>

            <div className="comparison-list">
              <div className="comparison-item">
                <X size={18} className="old-way-icon" />
                <span>Hanya memberi checklist kosong tanpa panduan konteks</span>
              </div>
              <div className="comparison-item">
                <X size={18} className="old-way-icon" />
                <span>Tidak ada pembagian tugas otomatis antar pasangan (CPP/CPW)</span>
              </div>
              <div className="comparison-item">
                <X size={18} className="old-way-icon" />
                <span>Pembengkakan biaya baru disadari di dekat hari pernikahan</span>
              </div>
              <div className="comparison-item">
                <X size={18} className="old-way-icon" />
                <span>Catatan seserahan & daftar tamu sering tercecer</span>
              </div>
            </div>
          </div>

          <div className="comparison-card amara-way">
            <div className="comparison-header">
              <CheckCircle2 size={24} className="amara-way-icon" />
              <span>Dengan Amara Wedding Companion</span>
            </div>

            <div className="comparison-list">
              <div className="comparison-item">
                <CheckCircle2 size={18} className="amara-way-icon" />
                <span>Pendampingan langkah demi langkah dari H-180 hingga Hari-H</span>
              </div>
              <div className="comparison-item">
                <CheckCircle2 size={18} className="amara-way-icon" />
                <span>Pembagian PIC jelas antara CPP & CPW agar tidak ada salah paham</span>
              </div>
              <div className="comparison-item">
                <CheckCircle2 size={18} className="amara-way-icon" />
                <span>Kalkulasi anggaran otomatis, catatan DP, & pengawasan financial</span>
              </div>
              <div className="comparison-item">
                <CheckCircle2 size={18} className="amara-way-icon" />
                <span>Dapat diakses kapan saja dari Handphone & Laptop (PWA App)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimoni">
        <div className="section-header">
          <span className="section-tag">Testimoni Pasangan</span>
          <h2 className="section-title">Cerita Kebahagiaan Pasangan Amara</h2>
          <p className="section-subtitle">
            Dengarkan langsung dari pasangan pengantin yang didampingi oleh Amara hingga hari bahagia mereka.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p className="testimonial-text">
                "Jujur Amara nolong banget! Dulu sering beda pendapat soal budget sama cowokku. Sebagai companion, Amara bikin semua transparan & jelas PIC tugasnya."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar-dummy">SA</div>
              <div>
                <div className="author-name">Sarah & Adit</div>
                <div className="author-date">Menikah di Jakarta</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p className="testimonial-text">
                "Fitur tracking seserahannya luar biasa! Barang yang udah dibeli & perlu dihias ke box ga ada yang kelewatan sama sekali."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar-dummy" style={{ background: '#3b82f6', color: '#fff' }}>RB</div>
              <div>
                <div className="author-name">Rizky & Bella</div>
                <div className="author-date">Menikah di Bandung</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p className="testimonial-text">
                "Simple, clean, dan langsung bisa diinstall ke HP kaya aplikasi bawaan. Highly recommended buat semua calon pengantin!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar-dummy" style={{ background: '#ec4899', color: '#fff' }}>DF</div>
              <div>
                <div className="author-name">Dion & Feby</div>
                <div className="author-date">Menikah di Surabaya</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section" id="faq">
        <div className="section-header">
          <span className="section-tag">Frequently Asked Questions</span>
          <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
        </div>

        <div className="faq-list">
          <div className="faq-item">
            <button className="faq-question-btn" onClick={() => toggleFaq(0)}>
              <span>Bagaimana cara mengaktifkan Lisensi Akses Amara?</span>
              {activeFaq === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {activeFaq === 0 && (
              <div className="faq-answer">
                Anda dapat membeli lisensi Amara (Order ID Lynk.id / Kode Akses). Masukkan Kode Akses atau Order ID Anda saat pendaftaran akun pertama kali untuk mengaktifkan lisensi selamanya.
              </div>
            )}
          </div>

          <div className="faq-item">
            <button className="faq-question-btn" onClick={() => toggleFaq(1)}>
              <span>Apakah 1 Lisensi berlaku untuk Pasangan (2 Akun)?</span>
              {activeFaq === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {activeFaq === 1 && (
              <div className="faq-answer">
                Ya! 1 Lisensi Amara memberikan akses lengkap untuk berdua (Calon Pengantin Pria & Calon Pengantin Wanita). Anda dapat mengundang pasangan via menu Pengaturan dan data akan tersinkronisasi otomatis.
              </div>
            )}
          </div>

          <div className="faq-item">
            <button className="faq-question-btn" onClick={() => toggleFaq(2)}>
              <span>Apakah aplikasi Amara perlu didownload dari App Store / Play Store?</span>
              {activeFaq === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {activeFaq === 2 && (
              <div className="faq-answer">
                Amara menggunakan teknologi Progressive Web App (PWA). Anda dapat langsung menyimpannya ke Layar Utama (Add to Home Screen) di HP tanpa perlu mengunduh file besar dari App Store.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <h2>Siap Menyambut Hari Bahagiamu Bersama Amara?</h2>
          <p>
            Dapatkan pendamping digital terbaik untuk merencanakan pernikahan impian yang tenang dan terorganisir.
          </p>
          <button className="btn-hero-secondary" onClick={() => navigate('/login?mode=signup')}>
            <span>Aktifkan Akses Amara</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/amara-logo.png" alt="Amara Wedding Companion" className="landing-logo-img" style={{ height: 32 }} />
            <span className="footer-text">© {new Date().getFullYear()} Amara Digital Wedding Companion. All Rights Reserved.</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="landing-nav-link" onClick={() => navigate('/login?mode=login')}>Masuk</button>
            <button className="landing-nav-link" onClick={() => navigate('/login?mode=signup')}>Aktifkan Akses</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
