import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      navigate(data.user.profileData?.onboardingComplete ? '/' : '/onboarding', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8">
          <div className="w-7 h-7 rounded bg-primary-600 flex items-center justify-center mb-6">
            <span className="text-white font-bold text-[11px]">JC</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Sign in to JobCrawler</h1>
          <p className="text-sm text-gray-600">Welcome back</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-3.5 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm pr-10"
                placeholder="your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gray-900 text-gray-50 text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 space-y-1 text-sm">
          <p className="text-gray-600">
            Need an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
