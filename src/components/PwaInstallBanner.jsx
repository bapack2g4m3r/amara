import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check, ArrowUpRight, ShieldCheck } from 'lucide-react';
import useLanguageStore from '../store/useLanguageStore';
import '../styles/PwaInstallBanner.css';

const DISMISS_KEY = 'amara_pwa_install_dismissed';
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

export default function PwaInstallBanner() {
  const { language } = useLanguageStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // 1. Check if running as Standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Check if device is iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // 3. Listen for Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed prompt recently
      const lastDismissed = localStorage.getItem(DISMISS_KEY);
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > DISMISS_DURATION) {
        // Show banner after a slight delay for smooth initial load
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccessfully(true);
      setIsStandalone(true);
      setTimeout(() => setInstalledSuccessfully(false), 5000);
    };

    // 4. Custom event for triggering install from Settings or buttons
    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowBanner(false);
          }
        });
      } else if (isIosDevice) {
        setShowIosModal(true);
      } else {
        // Fallback for browsers that don't support beforeinstallprompt or already prompt
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('amara-trigger-pwa-install', handleCustomTrigger);

    // For iOS users (who don't have beforeinstallprompt), show banner if not dismissed & not standalone
    if (isIosDevice) {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      const lastDismissed = localStorage.getItem(DISMISS_KEY);
      if (!isStandaloneMode && (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > DISMISS_DURATION)) {
        setTimeout(() => setShowBanner(true), 3500);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('amara-trigger-pwa-install', handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowBanner(false);
        }
      });
    } else if (isIOS) {
      setShowIosModal(true);
    } else {
      setShowBanner(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  // If app is already standalone, don't show prompt banner
  if (isStandalone && !installedSuccessfully) {
    return null;
  }

  return (
    <>
      {/* Toast Notification when installed */}
      {installedSuccessfully && (
        <div className="pwa-success-toast">
          <ShieldCheck size={20} />
          <span>{language === 'id' ? 'Amara berhasil terinstall di HP kamu!' : 'Amara successfully installed!'}</span>
        </div>
      )}

      {/* Bottom Floating PWA Banner */}
      {showBanner && !isStandalone && (
        <div className="pwa-floating-banner">
          <div className="pwa-banner-content">
            <div className="pwa-icon-box">
              <img src="/pwa-icon-192.png" alt="Amara Logo" className="pwa-app-logo" />
            </div>
            <div className="pwa-text-info">
              <h4 className="pwa-banner-title">
                {language === 'id' ? 'Install Aplikasi Amara' : 'Install Amara App'}
              </h4>
              <p className="pwa-banner-desc">
                {language === 'id'
                  ? 'Akses cepat dari layar HP, lebih ringan & tanpa perlu ketik URL!'
                  : 'Quick home screen access, lightweight & no URL typing!'}
              </p>
            </div>
          </div>

          <div className="pwa-banner-actions">
            <button type="button" className="btn-pwa-install" onClick={handleInstallClick}>
              <Download size={16} />
              <span>{language === 'id' ? 'Install' : 'Install'}</span>
            </button>
            <button type="button" className="btn-pwa-dismiss" onClick={handleDismiss} title={language === 'id' ? 'Tutup' : 'Dismiss'}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIosModal && (
        <div className="pwa-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-modal-header">
              <div className="pwa-modal-icon-badge">
                <Smartphone size={22} />
              </div>
              <div>
                <h3>{language === 'id' ? 'Cara Install di iPhone / iPad' : 'Install on iPhone / iPad'}</h3>
                <p>{language === 'id' ? 'Ikuti 2 langkah mudah berikut di browser Safari:' : 'Follow 2 easy steps in Safari browser:'}</p>
              </div>
              <button type="button" className="btn-close-pwa-modal" onClick={() => setShowIosModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pwa-ios-steps">
              <div className="pwa-ios-step-card">
                <div className="step-number">1</div>
                <div className="step-icon-wrapper">
                  <Share size={24} color="#007AFF" />
                </div>
                <div className="step-text">
                  <h5>{language === 'id' ? 'Tekan Tombol Share Safari' : 'Tap Safari Share Button'}</h5>
                  <p>
                    {language === 'id'
                      ? 'Temukan ikon Bagikan (Share) di baris bawah layar iPhone Anda.'
                      : 'Find the Share icon at the bottom toolbar of Safari.'}
                  </p>
                </div>
              </div>

              <div className="pwa-ios-step-card">
                <div className="step-number">2</div>
                <div className="step-icon-wrapper">
                  <PlusSquare size={24} color="#99182A" />
                </div>
                <div className="step-text">
                  <h5>{language === 'id' ? 'Pilih "Tambah ke Layar Utama"' : 'Select "Add to Home Screen"'}</h5>
                  <p>
                    {language === 'id'
                      ? 'Gulir ke bawah pada menu pilihan, lalu tekan "Tambah ke Layar Utama" (Add to Home Screen).'
                      : 'Scroll down the menu options and tap "Add to Home Screen".'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pwa-modal-footer">
              <button type="button" className="btn-pwa-modal-done" onClick={() => setShowIosModal(false)}>
                <Check size={16} />
                <span>{language === 'id' ? 'Saya Mengerti' : 'Got it'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
