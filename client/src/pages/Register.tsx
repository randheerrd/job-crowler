import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function OAuthButtons() {
  const base = API_BASE.replace('/api', '');
  return (
    <div className="space-y-2">
      <a
        href={`${base}/api/auth/google`}
        className="flex items-center justify-center gap-2.5 w-full px-3 py-2 bg-gray-200 border border-gray-300 text-gray-900 text-xs font-medium rounded hover:bg-gray-300/60 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Sign up with Google
      </a>
      <a
        href={`${base}/api/auth/linkedin`}
        className="flex items-center justify-center gap-2.5 w-full px-3 py-2 bg-gray-200 border border-gray-300 text-gray-900 text-xs font-medium rounded hover:bg-gray-300/60 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 72 72" fill="none">
          <rect width="72" height="72" rx="8" fill="#0A66C2"/>
          <path fill="#fff" d="M13.7 26.8h11.6v31.9H13.7zM19.5 22.3a6.7 6.7 0 1 1 0-13.4 6.7 6.7 0 0 1 0 13.4zM58.3 58.7H46.8V43.3c0-4.6-.1-10.5-6.4-10.5-6.4 0-7.4 5-7.4 10.2v15.7H21.6V26.8h11.1v4.4h.2c1.5-2.9 5.3-6 10.9-6 11.7 0 13.8 7.7 13.8 17.7v15.8z"/>
        </svg>
        Sign up with LinkedIn
      </a>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[340px]">
        <div className="mb-7">
          <svg width="22" height="22" viewBox="0 0 60 60" fill="none" className="mb-5 text-primary-500">
            <defs><clipPath id="reg-clip"><circle cx="28" cy="30" r="24"/></clipPath></defs>
            <circle cx="28" cy="30" r="26" stroke="currentColor" strokeWidth="3.5"/>
            <circle cx="37" cy="30" r="19" stroke="currentColor" strokeWidth="3.5" clipPath="url(#reg-clip)"/>
            <circle cx="46" cy="30" r="11" stroke="currentColor" strokeWidth="3.5" clipPath="url(#reg-clip)"/>
          </svg>
          <h1 className="text-[17px] font-semibold text-gray-900 mb-1">Create your account</h1>
          <p className="text-xs text-gray-600">Start discovering jobs across all portals</p>
        </div>

        {/* OAuth buttons */}
        <div className="mb-4">
          <OAuthButtons />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-[11px] text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2" placeholder="Your name" autoComplete="name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 pr-9" placeholder="Min 6 characters" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 disabled:opacity-50 transition-colors mt-1">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
