import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=' + (error || 'oauth'), { replace: true });
      return;
    }

    // Fetch full user info using the token
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setAuth(data, token);
        const onboardingDone = data.profileData?.onboardingComplete === true;
        navigate(onboardingDone ? '/' : '/onboarding', { replace: true });
      })
      .catch(() => navigate('/login?error=oauth', { replace: true }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-primary-500 animate-spin" />
        <p className="text-xs text-gray-600">Signing you in…</p>
      </div>
    </div>
  );
}
