import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Trash2, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AddSourceModal from './AddSourceModal';

interface Source {
  id: string;
  url: string;
  name: string;
  type: string;
  lastSync: string | null;
  jobCount: number;
}

const ATS_LABELS: Record<string, { label: string; color: string }> = {
  greenhouse:     { label: 'Greenhouse',           color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  lever:          { label: 'Lever',                color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ashby:          { label: 'Ashby',                color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  workatastartup: { label: 'YC / Work at Startup', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  workday:        { label: 'Workday',              color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  generic:        { label: 'Website',              color: 'bg-gray-400/10 text-gray-600 border-gray-400/20' },
};

// Pre-built popular sources
const QUICK_SOURCES = [
  { name: 'Y Combinator',   url: 'https://www.workatastartup.com', type: 'workatastartup', desc: 'All YC startup jobs' },
  { name: 'Stripe',         url: 'https://boards.greenhouse.io/stripe', type: 'greenhouse', desc: 'Greenhouse' },
  { name: 'Airbnb',         url: 'https://jobs.lever.co/airbnb', type: 'lever', desc: 'Lever' },
  { name: 'Notion',         url: 'https://jobs.lever.co/notion', type: 'lever', desc: 'Lever' },
  { name: 'Linear',         url: 'https://jobs.ashbyhq.com/linear', type: 'ashby', desc: 'Ashby' },
  { name: 'Vercel',         url: 'https://jobs.ashbyhq.com/vercel', type: 'ashby', desc: 'Ashby' },
  { name: 'Figma',          url: 'https://boards.greenhouse.io/figma', type: 'greenhouse', desc: 'Greenhouse' },
  { name: 'OpenAI',         url: 'https://jobs.ashbyhq.com/openai', type: 'ashby', desc: 'Ashby' },
  { name: 'Anthropic',      url: 'https://boards.greenhouse.io/anthropic', type: 'greenhouse', desc: 'Greenhouse' },
  { name: 'Zepto',          url: 'https://jobs.lever.co/zepto', type: 'lever', desc: 'Lever' },
  { name: 'Razorpay',       url: 'https://boards.greenhouse.io/razorpay', type: 'greenhouse', desc: 'Greenhouse' },
  { name: 'CRED',           url: 'https://jobs.lever.co/cred', type: 'lever', desc: 'Lever' },
];

function timeSince(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Sources() {
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: sources = [], isLoading } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => api.get('/sources').then(r => r.data),
  });

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await api.post(`/sources/${id}/sync`);
      qc.invalidateQueries({ queryKey: ['sources'] });
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/sources/${id}`);
      qc.setQueryData<Source[]>(['sources'], prev => prev?.filter(s => s.id !== id) || []);
      setConfirmDelete(null);
    } catch { /* ignore */ }
  };

  const handleAdded = () => {
    qc.invalidateQueries({ queryKey: ['sources'] });
    setShowModal(false);
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Custom job sources</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Fetch jobs from any company careers page — Greenhouse, Lever, Ashby, or any website.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 transition-colors shrink-0"
        >
          <Plus size={13} />
          Add source
        </button>
      </div>

      {/* Quick-add popular sources */}
      <div className="mb-5">
        <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wide mb-2">Popular sources</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SOURCES.map(s => {
            const alreadyAdded = sources.some(src => src.url === s.url);
            return (
              <button
                key={s.url}
                disabled={alreadyAdded}
                onClick={alreadyAdded ? undefined : () => setShowModal(true)}
                title={s.url}
                className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                  alreadyAdded
                    ? 'bg-gray-200 border-gray-300 text-gray-600 cursor-default'
                    : 'bg-gray-200 border-gray-300 text-gray-900 hover:border-primary-500/40 hover:text-primary-500 cursor-pointer'
                }`}
              >
                {alreadyAdded ? '✓ ' : ''}{s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sources table */}
      <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden mb-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : sources.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No custom sources yet"
            description="Add a Greenhouse, Lever, Ashby or any careers page URL to fetch jobs from it."
            action={
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 transition-colors"
              >
                <Plus size={13} />
                Add your first source
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pl-4">Source</th>
                <th className="text-left">Type</th>
                <th className="text-left">Jobs</th>
                <th className="text-left">Last sync</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sources.map(src => {
                const ats = ATS_LABELS[src.type] || ATS_LABELS.generic;
                const isSyncing = syncing === src.id;
                const isConfirming = confirmDelete === src.id;

                return (
                  <tr key={src.id} className="group">
                    <td className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">{src.name}</span>
                        <a href={src.url} target="_blank" rel="noreferrer"
                          className="text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      <span className="text-[11px] text-gray-600 truncate max-w-[200px] block">{src.url}</span>
                    </td>
                    <td>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ats.color}`}>
                        {ats.label}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-900 font-medium">
                        {src.jobCount > 0 ? src.jobCount : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600">
                        {src.lastSync ? timeSince(src.lastSync) : 'Never'}
                      </span>
                    </td>
                    <td className="pr-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isConfirming ? (
                          <>
                            <button onClick={() => handleDelete(src.id)}
                              className="px-2 py-0.5 text-[11px] bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded transition-colors">
                              Remove
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="px-2 py-0.5 text-[11px] text-gray-600 hover:text-gray-900 rounded transition-colors">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleSync(src.id)} disabled={isSyncing}
                              className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-300 rounded transition-colors disabled:opacity-50">
                              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                              {isSyncing ? 'Syncing…' : 'Sync'}
                            </button>
                            <button onClick={() => setConfirmDelete(src.id)}
                              className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors">
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

      {/* Info */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-200 border border-gray-300 rounded text-[11px] text-gray-600">
        <AlertCircle size={13} className="shrink-0 mt-0.5 text-gray-600" />
        <span>
          <strong className="text-gray-900">Greenhouse, Lever, Ashby</strong> use public APIs — very reliable.
          {' '}<strong className="text-gray-900">Generic websites</strong> use HTML parsing — works on most static pages.
          JavaScript-rendered pages may return fewer results.
        </span>
      </div>

      {showModal && (
        <AddSourceModal
          quickSources={QUICK_SOURCES}
          existingUrls={sources.map(s => s.url)}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
