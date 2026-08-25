import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { session, loading, initialize } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    useWeddingStore.getState().initCustomCategories();
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    if (session) {
      useWeddingStore.getState().fetchDashboardData();
      // Check if onboarding has been completed
      const onboardingDone = localStorage.getItem('amara_onboarding_done');
      if (!onboardingDone) {
        setShowWelcome(true);
      }
    }
  }, [session]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Re-fetch dashboard data to reflect any profile changes made during onboarding
    useWeddingStore.getState().fetchDashboardData();
  };

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
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
          </Routes>
        </main>
        {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      </div>
    </Router>
  );
}

export default App;

