import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Plus, Check, Sparkles } from 'lucide-react';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../../lib/utils';
import api from '../../lib/axios';
import type { Job } from '../../types';
import { useToastStore } from '../../store/toastStore';

interface Props {
  job: Job;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600', 'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-pink-600', 'from-indigo-500 to-blue-600',
];

function companyGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

// Derive "highlight" tags Otta-style from job data
function highlights(job: Job): string[] {
  const tags: string[] = [];
  if (/remote/i.test(job.jobType) || /remote/i.test(job.location)) tags.push('🌍 Remote-friendly');
  if (job.salary) tags.push('💰 Salary shared');
  if (/intern/i.test(job.jobType)) tags.push('🎓 Internship');
  if (/senior|lead|staff|principal/i.test(job.title)) tags.push('⭐ Senior role');
  tags.push(`💼 ${job.jobType}`);
  return tags.slice(0, 4);
}

export default function JobCard({ job, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [savingJob, setSavingJob] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState(false);
  const { toast } = useToastStore();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavingJob(true);
    try {
      if (saved) {
        await api.delete(`/jobs/save/${job.id}`);
        setSaved(false);
        onSaveToggle?.(job.id, false);
      } else {
        await api.post(`/jobs/save/${job.id}`);
        setSaved(true);
        onSaveToggle?.(job.id, true);
        toast('Saved to your list');
      }
    } finally {
      setSavingJob(false);
    }
  };

  const handleTrack = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tracking || tracked) return;
    setTracking(true);
    try {
      await api.post('/applications', { jobId: job.id, status: 'Applied' });
      setTracked(true);
      toast('Added to your tracker!');
    } catch {
      setTracked(true);
      toast('Already in your tracker', 'info');
    } finally {
      setTracking(false);
    }
  };

  const tags = highlights(job);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group"
    >
      {/* Header: logo + company + save */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={cn(
            'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-sm',
            companyGradient(job.company)
          )}>
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700 truncate">{job.company}</p>
              <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0', PORTAL_COLORS[job.portal] || 'bg-gray-100 text-gray-600')}>
                {job.portal}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin size={10} />
              {job.location}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={savingJob}
          className={cn(
            'p-2.5 rounded-xl transition-all shrink-0',
            saved ? 'text-primary-600 bg-primary-50' : 'text-slate-300 hover:text-primary-500 hover:bg-primary-50'
          )}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors leading-snug mb-1">
        {job.title}
      </h3>
      {job.salary && (
        <p className="text-sm font-semibold text-emerald-600 mb-3">{formatSalary(job.salary)}</p>
      )}

      {/* Highlight tags */}
      <div className="flex flex-wrap gap-2 mb-5 mt-3">
        {tags.map(tag => (
          <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">Posted {formatDate(job.postedAt)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTrack}
            disabled={tracking || tracked}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors',
              tracked
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            {tracked ? <Check size={13} /> : <Plus size={13} />}
            {tracked ? 'Tracked' : 'Track'}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Apply <ArrowUpRight size={13} />
          </a>
        </div>
      </div>

      {/* Hover hint */}
      <div className="flex items-center gap-1 mt-3 text-[11px] text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles size={11} />
        Click to view full details
      </div>
    </Link>
  );
}
