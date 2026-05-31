import { useState } from 'react';
import { X, Eye, EyeOff, Search } from 'lucide-react';
import { PORTAL_META, PORTAL_CATEGORIES } from '../../lib/utils';
import api from '../../lib/axios';
import type { Credential } from '../../types';

interface Props {
  existingPortals: string[];
  onClose: () => void;
  onAdded: (credential: Credential) => void;
}

export default function AddCredentialModal({ existingPortals, onClose, onAdded }: Props) {
  const [step, setStep] = useState<'pick' | 'form'>('pick');
  const [portal, setPortal] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availablePortals = Object.entries(PORTAL_META).filter(
    ([name]) => !existingPortals.includes(name)
  );

  const filtered = availablePortals.filter(([name, meta]) => {
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      meta.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || meta.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<Credential>('/credentials', {
        portal, username: form.username, password: form.password,
      });
      onAdded(data);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to connect portal');
    } finally {
      setLoading(false);
    }
  };

  const selectedMeta = portal ? PORTAL_META[portal] : null;
  const categories = ['All', ...PORTAL_CATEGORIES];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 border border-gray-300 rounded w-full max-w-md shadow-xl flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            {step === 'form' && (
              <button onClick={() => { setStep('pick'); setPortal(''); }} className="text-gray-600 hover:text-gray-900 mr-0.5">
                ←
              </button>
            )}
            {step === 'pick' ? 'Add portal' : `Connect ${portal}`}
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={15} />
          </button>
        </div>

        {/* ── STEP 1: Pick portal ── */}
        {step === 'pick' && (
          <>
            <div className="px-4 pt-3 pb-2 shrink-0 space-y-2">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  autoFocus
                  placeholder="Search portals…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-gray-200 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500"
                />
              </div>
              {/* Category pills */}
              <div className="flex gap-1 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      activeCategory === cat
                        ? 'bg-primary-500/15 text-primary-500 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Portal list */}
            <div className="overflow-y-auto flex-1 px-2 pb-3">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-8">No portals match.</p>
              ) : (
                <div>
                  {filtered.map(([name, meta]) => (
                    <button
                      key={name}
                      onClick={() => { setPortal(name); setStep('form'); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-left group"
                    >
                      <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 ${meta.accent} ${meta.text}`}>
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900">{name}</div>
                        <div className="text-[11px] text-gray-600 truncate">{meta.desc}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${meta.accent} ${meta.text}`}>
                        {meta.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STEP 2: Credential form ── */}
        {step === 'form' && selectedMeta && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
            {/* Portal pill */}
            <div className="flex items-center gap-2.5 p-3 bg-gray-200 border border-gray-300 rounded">
              <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${selectedMeta.accent} ${selectedMeta.text}`}>
                {portal.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{portal}</p>
                <p className="text-[11px] text-gray-600">{selectedMeta.desc}</p>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">{error}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Email / Username</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500"
                  placeholder={`your ${portal} email`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500 pr-9"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">Encrypted with AES-256-GCM.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Connecting…' : 'Connect portal'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
