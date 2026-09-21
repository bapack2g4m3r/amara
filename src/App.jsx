import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useWeddingStore from './store/useWeddingStore';
import Navigation from './components/Navigation';
import WelcomeModal from './components/WelcomeModal';
import Overview from './pages/Overview';
import Activities from './pages/Activities';
import Timeline from './pages/Timeline';
import Budget from './pages/Budget';
import Seserahan from './pages/Seserahan';
import Vendor from './pages/Vendor';
import GuestList from './pages/GuestList';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import JoinInvite from './pages/JoinInvite';
import Admin from './pages/Admin';
import AccessGatekeeperModal from './components/AccessGatekeeperModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import LandingPage from './pages/LandingPage';
import { supabase } from './lib/supabase';

import PwaInstallBanner from './components/PwaInstallBanner';

import ReadOnlyBanner from './components/ReadOnlyBanner';

import { APP_CONFIG } from './config/appConfig';

function AuthenticatedApp() {
  const { session, isPasswordRecovery } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [accessReason, setAccessReason] = useState(null);
  const [checkedAccess, setCheckedAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (session) {
      const verifyAndInit = async () => {
        const email = session.user?.email;
        const userId = session.user?.id;

        // 1. Claim pending access code (from URL query ?code= / ?order_id= or Google OAuth return)
        let codeFromUrl = null;
        try {
          const searchParams = new URLSearchParams(window.location.search);
          codeFromUrl = searchParams.get('code') || searchParams.get('c') || searchParams.get('order_id');
        } catch (_e) {
          // ignore
        }

        const pendingAccessCode = codeFromUrl || localStorage.getItem('amara_pending_access_code');
        if (pendingAccessCode) {
          localStorage.removeItem('amara_pending_access_code');
          try {
            await supabase.rpc('claim_access_code', {
              p_code: pendingAccessCode,
              p_email: email,
              p_user_id: userId
            });
            // Clean query parameter from URL without full reload
            if (codeFromUrl) {
              const cleanUrl = window.location.pathname + window.location.hash;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          } catch (claimErr) {
            console.error('Failed claiming pending access code:', claimErr);
          }
        }

        // 1b. Check if user came with a pending partner invitation code (e.g. AMARA-XXXXXX)
        const pendingInviteCode = localStorage.getItem('amara_pending_invite') || (codeFromUrl && codeFromUrl.toUpperCase().startsWith('AMARA-') ? codeFromUrl : null);
        const pendingInviteData = localStorage.getItem('amara_pending_invite_data');
        if (pendingInviteCode && location.pathname !== '/join') {
          localStorage.removeItem('amara_pending_invite');
          localStorage.removeItem('amara_pending_invite_data');
          const query = pendingInviteData ? `code=${pendingInviteCode}&d=${pendingInviteData}` : `code=${pendingInviteCode}`;
          window.location.href = `/join?${query}`;
          return;
        }

        // 2. Check user access authorization
        const isSuperAdmin = email === 'agung5s7@gmail.com';
        if (isSuperAdmin) {
          setHasAccess(true);
          setAccessReason(null);
          setCheckedAccess(true);
        } else {
          try {
            const { data: accessRes } = await supabase.rpc('check_user_access');
            const isAllowed = Boolean(accessRes?.has_access);
            setHasAccess(isAllowed);
            setAccessReason(accessRes?.reason || null);
            setCheckedAccess(true);
            if (!isAllowed && location.pathname !== '/join') return; // Block further data load if no license and not joining
          } catch (_err) {
            // Fallback allow if network or mock mode
            setHasAccess(true);
            setCheckedAccess(true);
          }
        }

        // 3. Load dashboard data for authorized users
        useWeddingStore.getState().fetchDashboardData().then(() => {
          const store = useWeddingStore.getState();

          const isJoinPage = location.pathname === '/join';
          const hasPendingInvite = Boolean(localStorage.getItem('amara_pending_invite'));

          // If current user is on /join page, has pending invite, or is a linked partner -> DO NOT show welcome onboarding!
          if (isJoinPage || hasPendingInvite || store.myProfile?.wedding_owner_id) {
            if (userId) {
              localStorage.setItem(`amara_onboarding_done_${userId}`, 'true');
            }
            sessionStorage.setItem('amara_onboarding_session_done', 'true');
            setShowWelcome(false);
            return;
          }

          // Check if user has completed or dismissed onboarding for this specific account
          const userOnboardingDone = userId ? localStorage.getItem(`amara_onboarding_done_${userId}`) : null;
          const sessionDismissed = sessionStorage.getItem('amara_onboarding_session_done');

          // Check whether profile is actually configured with partner names or date
          const hasConfiguredProfile = Boolean(
            (store.profile?.partner_1_name || store.profile?.groom_name) && 
            store.profile?.wedding_date
          );

          // Show welcome onboarding if profile is unconfigured AND not dismissed
          if (!hasConfiguredProfile && !userOnboardingDone && !sessionDismissed) {
            setShowWelcome(true);
          } else {
            setShowWelcome(false);
          }
        });
      };

      verifyAndInit();
    }
  }, [session, location.pathname]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    useWeddingStore.getState().fetchDashboardData();
  };

  if (!session) {
    return (
      <Routes>
        <Route 
          path="/" 
          element={APP_CONFIG.ENABLE_LANDING_PAGE ? <LandingPage /> : <Navigate to="/login" replace />} 
        />
        <Route path="/login" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/join" element={<JoinInvite />} />
        <Route 
          path="*" 
          element={<Navigate to={APP_CONFIG.ENABLE_LANDING_PAGE ? "/" : "/login"} replace />} 
        />
      </Routes>
    );
  }

  // Gatekeeper block: If user has logged in but has no valid access code / license
  // DO NOT block if user is currently on /join page (accepting partner invitation)
  const isJoinRoute = location.pathname === '/join';
  if (checkedAccess && !hasAccess && !isJoinRoute) {
    return (
      <AccessGatekeeperModal 
        userEmail={session.user?.email} 
        userId={session.user?.id}
        reason={accessReason}
        onAccessGranted={() => {
          setHasAccess(true);
          setAccessReason(null);
          useWeddingStore.getState().fetchDashboardData();
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <ReadOnlyBanner />
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/seserahan" element={<Seserahan />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/join" element={<JoinInvite />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      {isPasswordRecovery && <ResetPasswordModal />}
      <PwaInstallBanner />
    </div>
  );
}

function App() {
  const { loading, initialize } = useAuthStore();

  useEffect(() => {
    useWeddingStore.getState().initCustomCategories();
    useWeddingStore.getState().initSeserahan();
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <AuthenticatedApp />
    </Router>
  );
}

export default App;
