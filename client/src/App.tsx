import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './lib/axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import Tracker from './pages/Tracker';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const isDev = import.meta.env.DEV;
  const [booting, setBooting] = useState(isDev && !isAuthenticated);

  useEffect(() => {
    if (isDev && !isAuthenticated) {
      api.get('/auth/dev-login')
        .then(r => setAuth(r.data.user, r.data.token))
        .finally(() => setBooting(false));
    }
  }, []);

  if (booting) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const onboardingDone = user?.profileData?.onboardingComplete === true;

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route
        path="/onboarding"
        element={onboardingDone ? <Navigate to="/" replace /> : <Onboarding />}
      />
      <Route
        path="/"
        element={onboardingDone ? <Layout /> : <Navigate to="/onboarding" replace />}
      >
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
