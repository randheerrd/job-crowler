import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './lib/axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import Tracker from './pages/Tracker';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [booting, setBooting] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      api.get('/auth/dev-login')
        .then(r => setAuth(r.data.user, r.data.token))
        .finally(() => setBooting(false));
    }
  }, []);

  if (booting) return <LoadingSpinner fullPage />;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="tracker" element={<Tracker />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
