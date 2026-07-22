import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useWeddingStore from './store/useWeddingStore';
import Navigation from './components/Navigation';
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

  useEffect(() => {
    useWeddingStore.getState().initCustomCategories();
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    if (session) {
      useWeddingStore.getState().fetchDashboardData();
    }
  }, [session]);

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
      </div>
    </Router>
  );
}

export default App;
