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
import Vendor from './pages/Vendor';
import GuestList from './pages/GuestList';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import JoinInvite from './pages/JoinInvite';

function AuthenticatedApp() {
  const { session } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (session) {
      useWeddingStore.getState().fetchDashboardData().then(() => {
        const store = useWeddingStore.getState();
        const userId = session.user?.id;

        // If current user is a linked partner, they are joining an existing wedding - DO NOT show welcome onboarding!
        if (store.myProfile?.wedding_owner_id) {
          if (userId) {
            localStorage.setItem(`amara_onboarding_done_${userId}`, 'true');
          }
          setShowWelcome(false);
          return;
        }

        // Check if user has completed or dismissed onboarding for this specific account
        const userOnboardingDone = userId ? localStorage.getItem(`amara_onboarding_done_${userId}`) : null;
        const sessionDismissed = sessionStorage.getItem('amara_onboarding_session_done');

        // Check whether profile is actually configured with partner names or date
        const hasConfiguredProfile = Boolean(
          store.profile?.partner_1_name && 
          store.profile?.wedding_date
        );

        // Show welcome onboarding if profile is unconfigured AND not dismissed
        if (!hasConfiguredProfile && !userOnboardingDone && !sessionDismissed) {
          setShowWelcome(true);
        } else {
          setShowWelcome(false);
        }
      });
      
      // If user came with a pending invite code, handle that
      const pendingCode = localStorage.getItem('amara_pending_invite');
      const pendingData = localStorage.getItem('amara_pending_invite_data');
      if (pendingCode && location.pathname !== '/join') {
        localStorage.removeItem('amara_pending_invite');
        localStorage.removeItem('amara_pending_invite_data');
        const query = pendingData ? `code=${pendingCode}&d=${pendingData}` : `code=${pendingCode}`;
        window.location.href = `/join?${query}`;
        return;
      }
    }
  }, [session, location.pathname]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    useWeddingStore.getState().fetchDashboardData();
  };

  if (!session) {
    return (
      <Routes>
        <Route path="/join" element={<JoinInvite />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/join" element={<JoinInvite />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
    </div>
  );
}

function App() {
  const { loading, initialize } = useAuthStore();

  useEffect(() => {
    useWeddingStore.getState().initCustomCategories();
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
