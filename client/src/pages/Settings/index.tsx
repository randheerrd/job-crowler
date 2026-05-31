import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, RefreshCw, Trash2, Plus, Shield, User, Save, Lock } from 'lucide-react';
import api from '../../lib/axios';
import type { Credential } from '../../types';
import { PORTAL_META } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import AddCredentialModal from './AddCredentialModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { KeyRound } from 'lucide-react';

const STATUS = {
  connected: { icon: CheckCircle2, label: 'Connected',   color: 'text-emerald-400' },
  failed:    { icon: XCircle,      label: 'Auth failed', color: 'text-red-400'     },
  pending:   { icon: Clock,        label: 'Pending',     color: 'text-amber-400'   },
};

// ── Autofill profile sub-form ─────────────────────────────────────────────────
function AutofillProfile() {
  const [form, setForm] = useState({
    phone: '', city: '', country: '', linkedinUrl: '', portfolioUrl: '',
    currentTitle: '', currentCompany: '', yearsExperience: '', summary: '',
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useQuery({
    queryKey: ['autofill-profile'],
    queryFn: () => api.get('/extension/autofill-profile').then(r => r.data),
    onSuccess: (data: typeof form) => {
      setForm(f => ({ ...f, ...data }));
      setLoaded(true);
    },
  } as Parameters<typeof useQuery>[0]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/extension/autofill-profile', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500 transition-colors';

  if (!loaded) return <div className="flex justify-center py-6"><LoadingSpinner size="sm" /></div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input className={input} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        </Field>
        <Field label="City">
          <input className={input} value={form.city} onChange={set('city')} placeholder="Bangalore" />
        </Field>
        <Field label="Country">
          <input className={input} value={form.country} onChange={set('country')} placeholder="India" />
        </Field>
        <Field label="Years of experience">
          <input className={input} value={form.yearsExperience} onChange={set('yearsExperience')} placeholder="3" type="number" min="0" />
        </Field>
        <Field label="Current job title">
          <input className={input} value={form.currentTitle} onChange={set('currentTitle')} placeholder="Product Designer" />
        </Field>
        <Field label="Current company">
          <input className={input} value={form.currentCompany} onChange={set('currentCompany')} placeholder="Acme Corp" />
        </Field>
      </div>
      <Field label="LinkedIn URL">
        <input className={input} value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/yourname" />
      </Field>
      <Field label="Portfolio / GitHub URL">
        <input className={input} value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://yourportfolio.com" />
      </Field>
      <Field label="Professional summary">
        <textarea
          className={`${input} resize-none`}
          rows={3}
          value={form.summary}
          onChange={set('summary')}
          placeholder="2–3 sentences about yourself that can be auto-filled into cover letter or bio fields."
        />
      </Field>
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 disabled:opacity-60 transition-colors"
        >
          <Save size={12} />
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save profile'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Password management ───────────────────────────────────────────────────────
function PasswordSection({ isOAuthUser }: { isOAuthUser: boolean }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', {
        currentPassword: isOAuthUser ? undefined : form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg({ type: 'success', text: 'Password updated successfully.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const text = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update password.';
      setMsg({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isOAuthUser && (
        <Field label="Current password">
          <input type="password" className={input} value={form.currentPassword}
            onChange={set('currentPassword')} placeholder="••••••••" required autoComplete="current-password" />
        </Field>
      )}
      {isOAuthUser && (
        <p className="text-[11px] text-gray-600 bg-gray-100 border border-gray-300 rounded px-3 py-2">
          You signed in with Google/LinkedIn. Set a password to also enable email login.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="New password">
          <input type="password" className={input} value={form.newPassword}
            onChange={set('newPassword')} placeholder="Min 6 characters" required autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <input type="password" className={input} value={form.confirmPassword}
            onChange={set('confirmPassword')} placeholder="Repeat password" required autoComplete="new-password" />
        </Field>
      </div>
      {msg && (
        <p className={`text-[11px] px-3 py-2 rounded ${msg.type === 'success'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {msg.text}
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 disabled:opacity-60 transition-colors">
          <Lock size={12} />
          {saving ? 'Updating…' : isOAuthUser ? 'Set password' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuthStore();
  const isOAuthUser = !!(user?.profileData as { authProvider?: string })?.authProvider;
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: credentials = [], isLoading } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: () => api.get('/credentials').then(r => r.data),
  });

  const handleAdded = (c: Credential) => {
    qc.setQueryData<Credential[]>(['credentials'], prev => [...(prev || []), c]);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/credentials/${id}`);
      qc.setQueryData<Credential[]>(['credentials'], prev => prev?.filter(c => c.id !== id) || []);
      setConfirmDelete(null);
    } catch { /* ignore */ }
  };

  const handleTest = async (cred: Credential) => {
    setTesting(cred.id);
    try {
      const { data } = await api.post(`/credentials/${cred.id}/test`);
      qc.setQueryData<Credential[]>(['credentials'], prev =>
        prev?.map(c => c.id === cred.id ? { ...c, status: data.status } : c) || []
      );
    } catch {
      qc.setQueryData<Credential[]>(['credentials'], prev =>
        prev?.map(c => c.id === cred.id ? { ...c, status: 'failed' } : c) || []
      );
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Autofill Profile ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User size={14} className="text-primary-500" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Autofill profile</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              The extension uses this to auto-fill job application forms on any portal.
            </p>
          </div>
        </div>
        <div className="bg-gray-200 border border-gray-300 rounded p-4">
          <AutofillProfile />
        </div>
      </div>

      {/* ── Password ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} className="text-primary-500" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isOAuthUser ? 'Set a password' : 'Change password'}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {isOAuthUser
                ? 'Add email + password login to your account.'
                : 'Update your account password.'}
            </p>
          </div>
        </div>
        <div className="bg-gray-200 border border-gray-300 rounded p-4">
          <PasswordSection isOAuthUser={isOAuthUser} />
        </div>
      </div>

      {/* ── Portal connections ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Portal connections</h2>
            <p className="text-xs text-gray-600 mt-0.5">Connect your accounts to auto-fetch job listings.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 transition-colors"
          >
            <Plus size={13} />
            Add portal
          </button>
        </div>

        <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden mb-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : credentials.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No portals connected"
              description="Add LinkedIn, Naukri, Indeed and more to start aggregating jobs."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 transition-colors"
                >
                  <Plus size={13} />
                  Add your first portal
                </button>
              }
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pl-4">Portal</th>
                  <th className="text-left">Account</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Added</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {credentials.map(cred => {
                  const meta = PORTAL_META[cred.portal];
                  const s = STATUS[cred.status as keyof typeof STATUS] || STATUS.pending;
                  const StatusIcon = s.icon;
                  const isTestingThis = testing === cred.id;
                  const isConfirming = confirmDelete === cred.id;

                  return (
                    <tr key={cred.id} className="group">
                      <td className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${meta?.accent ?? 'bg-gray-300'} ${meta?.text ?? 'text-gray-900'}`}>
                            {cred.portal.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-900">{cred.portal}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-gray-600 truncate max-w-[160px] block">{cred.username}</span>
                      </td>
                      <td>
                        <span className={`flex items-center gap-1 text-xs ${s.color}`}>
                          <StatusIcon size={11} />
                          {s.label}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-600">
                          {new Date(cred.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="pr-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isConfirming ? (
                            <>
                              <button onClick={() => handleDelete(cred.id)} className="px-2 py-0.5 text-[11px] bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded transition-colors">Remove</button>
                              <button onClick={() => setConfirmDelete(null)} className="px-2 py-0.5 text-[11px] text-gray-600 hover:text-gray-900 rounded transition-colors">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleTest(cred)}
                                disabled={isTestingThis}
                                className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-300 rounded transition-colors disabled:opacity-50"
                              >
                                <RefreshCw size={10} className={isTestingThis ? 'animate-spin' : ''} />
                                {isTestingThis ? 'Testing…' : 'Test'}
                              </button>
                              <button onClick={() => setConfirmDelete(cred.id)} className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-200 border border-gray-300 rounded">
        <Shield size={13} className="text-gray-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-600">
          Passwords are encrypted with <span className="text-gray-900">AES-256-GCM</span> — never stored as plain text.
        </p>
      </div>

      {showModal && (
        <AddCredentialModal
          existingPortals={credentials.map(c => c.portal)}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
