import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Copy, Check, RefreshCw, Puzzle, ArrowRight, Zap, Chrome } from 'lucide-react';
import api from '../../lib/axios';

const STEPS = [
  {
    n: '01',
    title: 'Install the extension',
    desc: 'Add Calos to Chrome from the Web Store. It takes under 10 seconds.',
  },
  {
    n: '02',
    title: 'Paste your token',
    desc: 'Open the extension → Settings → paste your API token below. This links it to your account.',
  },
  {
    n: '03',
    title: 'Browse & save jobs',
    desc: 'Visit LinkedIn, Indeed, Naukri, or any supported portal. Click "Save to Calos" on any listing.',
  },
];

const SUPPORTED = [
  'LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Wellfound',
  'Internshala', 'Remotive', 'Dice', 'ZipRecruiter', 'Monster',
];

export default function Extension() {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const { data, refetch } = useQuery<{ token: string }>({
    queryKey: ['extension-token'],
    queryFn: () => api.get('/extension/token').then(r => r.data),
  });

  const { mutate: regenerate } = useMutation({
    mutationFn: () => api.post('/extension/token/regenerate').then(r => r.data),
    onMutate: () => setRegenerating(true),
    onSuccess: () => { refetch(); setRegenerating(false); },
    onError: () => setRegenerating(false),
  });

  const token = data?.token ?? '';
  const maskedToken = token ? token.slice(0, 8) + '••••••••••••••••••••••••••••••••' + token.slice(-4) : '';

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-7">
        <div className="w-9 h-9 rounded bg-primary-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Puzzle size={16} className="text-primary-500" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Chrome Extension</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            One-click save from any job portal directly into your dashboard.
          </p>
        </div>

        {/* Chrome Web Store button */}
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 border border-gray-300 text-gray-900 text-xs font-medium rounded hover:bg-gray-300/60 transition-colors shrink-0"
        >
          <Chrome size={13} />
          Add to Chrome
          <ArrowRight size={11} className="text-gray-600" />
        </a>
      </div>

      {/* API Token card */}
      <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-primary-500" />
            <span className="text-xs font-semibold text-gray-900">Your API token</span>
          </div>
          <button
            onClick={() => regenerate()}
            disabled={regenerating}
            className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-3 py-2.5">
            <code className="flex-1 text-xs text-gray-900 font-mono tracking-wide select-all">
              {token ? maskedToken : '—'}
            </code>
            <button
              onClick={copyToken}
              disabled={!token}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-300 hover:bg-gray-300/80 text-gray-900 rounded transition-colors disabled:opacity-40 shrink-0"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-gray-600 mt-2">
            Paste this in the extension settings. Regenerating invalidates the old token.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-300">
          <span className="text-xs font-semibold text-gray-900">How it works</span>
        </div>
        <div className="divide-y divide-gray-300">
          {STEPS.map(step => (
            <div key={step.n} className="flex items-start gap-3.5 px-4 py-3.5">
              <span className="text-xs font-bold text-primary-500/60 font-mono shrink-0 mt-0.5 w-5">
                {step.n}
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{step.title}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported portals */}
      <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-300">
          <span className="text-xs font-semibold text-gray-900">Supported portals</span>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-1.5">
          {SUPPORTED.map(p => (
            <span key={p} className="px-2 py-0.5 bg-gray-300/60 border border-gray-300 text-[11px] text-gray-900 rounded">
              {p}
            </span>
          ))}
          <span className="px-2 py-0.5 text-[11px] text-gray-600">+ more</span>
        </div>
      </div>

      {/* Extension API reference */}
      <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-300">
          <span className="text-xs font-semibold text-gray-900">Extension API</span>
          <span className="text-[11px] text-gray-600 ml-2">for developers building the extension</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Ingest endpoint</p>
            <code className="block bg-gray-100 border border-gray-300 rounded px-3 py-2 text-[11px] font-mono text-gray-900">
              POST /api/extension/ingest
            </code>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Auth header</p>
            <code className="block bg-gray-100 border border-gray-300 rounded px-3 py-2 text-[11px] font-mono text-gray-900">
              x-extension-token: {'<your-token>'}
            </code>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Request body (JSON)</p>
            <pre className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-[11px] font-mono text-gray-900 overflow-x-auto leading-relaxed">{`{
  "title":       "Senior Frontend Engineer",
  "company":     "Acme Corp",
  "url":         "https://linkedin.com/jobs/view/...",
  "portal":      "LinkedIn",
  "location":    "Remote",
  "jobType":     "Full-time",
  "salary":      "₹40–60 LPA",
  "description": "..."
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
