import { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';

interface QuickSource { name: string; url: string; type: string; desc: string; }

interface ScrapedJob {
  title: string; company: string; location: string;
  jobType: string; url: string; portal: string;
}

interface Props {
  quickSources: QuickSource[];
  existingUrls: string[];
  onClose: () => void;
  onAdded: () => void;
}

type Step = 'input' | 'preview' | 'saving' | 'done';

const ATS_HINT: Record<string, string> = {
  greenhouse:     'Greenhouse — will use public JSON API',
  lever:          'Lever — will use public JSON API',
  ashby:          'Ashby — will use public GraphQL API',
  workatastartup: 'YC / Work at a Startup',
  generic:        'Generic website — will parse HTML',
};

export default function AddSourceModal({ quickSources, existingUrls, onClose, onAdded }: Props) {
  const [step, setStep]     = useState<Step>('input');
  const [url, setUrl]       = useState('');
  const [detectedType, setDetectedType] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [jobs, setJobs]     = useState<ScrapedJob[]>([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const detectATS = (u: string) => {
    if (/boards\.greenhouse\.io|job-boards\.greenhouse\.io/.test(u)) return 'greenhouse';
    if (/jobs\.lever\.co/.test(u))      return 'lever';
    if (/jobs\.ashbyhq\.com/.test(u))   return 'ashby';
    if (/workatastartup\.com|ycombinator\.com/.test(u)) return 'workatastartup';
    return 'generic';
  };

  const handleFetch = async (fetchUrl = url) => {
    const normalized = fetchUrl.trim().startsWith('http') ? fetchUrl.trim() : 'https://' + fetchUrl.trim();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/sources/preview', { url: normalized });
      setJobs(data.jobs || []);
      setDetectedType(data.type);
      setDetectedName(data.name);
      setUrl(normalized);
      setStep('preview');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Could not fetch jobs from this URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setStep('saving');
    try {
      const { data } = await api.post('/sources/save', {
        jobs,
        sourceUrl: url,
        sourceName: detectedName,
      });
      setSavedCount(data.saved);
      setStep('done');
    } catch {
      setError('Failed to save jobs.');
      setStep('preview');
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-600 outline-none focus:border-primary-500 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 border border-gray-300 rounded w-full max-w-lg shadow-xl flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'preview' && (
              <button onClick={() => setStep('input')} className="text-gray-600 hover:text-gray-900 text-xs">←</button>
            )}
            <span className="text-sm font-medium text-gray-900">
              {step === 'input'   ? 'Add job source' :
               step === 'preview' ? `${jobs.length} jobs found` :
               step === 'saving'  ? 'Saving jobs…' :
                                    'Done!'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900"><X size={15} /></button>
        </div>

        {/* ── STEP: Input ── */}
        {step === 'input' && (
          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1.5">
                Careers page URL
              </label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className={inputClass + ' flex-1'}
                  placeholder="boards.greenhouse.io/stripe  or  jobs.lever.co/notion"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && url && handleFetch()}
                />
                <button
                  onClick={() => handleFetch()}
                  disabled={!url.trim() || loading}
                  className="px-3 py-2 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {loading ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={12} />}
                  {loading ? 'Fetching…' : 'Fetch'}
                </button>
              </div>
              {url && !loading && (
                <p className="text-[11px] text-gray-600 mt-1.5">
                  Detected: <span className="text-gray-900">{ATS_HINT[detectATS(url)] || 'Auto-detect'}</span>
                </p>
              )}
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400">
                  <AlertCircle size={11} /> {error}
                </div>
              )}
            </div>

            {/* Quick picks */}
            <div>
              <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wide mb-2">Quick pick</p>
              <div className="space-y-1">
                {quickSources.filter(s => !existingUrls.includes(s.url)).map(s => (
                  <button
                    key={s.url}
                    onClick={() => { setUrl(s.url); handleFetch(s.url); }}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{s.name}</p>
                      <p className="text-[11px] text-gray-600 truncate">{s.url}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: Preview ── */}
        {step === 'preview' && (
          <>
            <div className="px-4 py-3 border-b border-gray-300 shrink-0 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900">{detectedName}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {ATS_HINT[detectedType] || 'Auto-detected'} · {jobs.length} jobs
                </p>
              </div>
              <a href={url} target="_blank" rel="noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors">
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-300">
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <AlertCircle size={18} className="text-gray-600 mb-2" />
                  <p className="text-xs text-gray-900 font-medium">No jobs found</p>
                  <p className="text-[11px] text-gray-600 mt-1">The page may require JavaScript to render. Try opening it in the browser and using the extension instead.</p>
                </div>
              ) : jobs.map((job, i) => (
                <div key={i} className="px-4 py-2.5 hover:bg-gray-200 transition-colors">
                  <p className="text-xs font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {job.company} · {job.location}
                    {job.jobType && job.jobType !== 'Full-time' && ` · ${job.jobType}`}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-300 flex gap-2 shrink-0">
              <button onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={jobs.length === 0}
                className="flex-1 py-2 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 disabled:opacity-50 transition-colors">
                Save {jobs.length} jobs to dashboard
              </button>
            </div>
          </>
        )}

        {/* ── STEP: Saving ── */}
        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-primary-500 animate-spin" />
            <p className="text-xs text-gray-600">Saving jobs to your dashboard…</p>
          </div>
        )}

        {/* ── STEP: Done ── */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{savedCount} jobs saved</p>
            <p className="text-xs text-gray-600">
              {detectedName} has been added as a source. You can sync it anytime to fetch new listings.
            </p>
            <button onClick={onAdded}
              className="mt-2 px-4 py-2 bg-primary-500 text-gray-50 text-xs font-medium rounded hover:bg-primary-500/90 transition-colors">
              View in Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
