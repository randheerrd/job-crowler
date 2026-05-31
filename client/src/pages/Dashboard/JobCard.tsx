import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Bookmark, BookmarkCheck, ArrowUpRight, Plus, Check } from 'lucide-react';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../../lib/utils';
import api from '../../lib/axios';
import type { Job } from '../../types';
import { useToastStore } from '../../store/toastStore';

interface Props {
  job: Job;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

const AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#06b6d4','#f97316','#6366f1',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function JobCard({ job, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [savingJob, setSavingJob] = useState(false);
  const [tracked, setTracked] = useState(false);
  const { toast } = useToastStore();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setSavingJob(true);
    try {
      if (saved) {
        await api.delete(`/jobs/save/${job.id}`);
        setSaved(false); onSaveToggle?.(job.id, false);
      } else {
        await api.post(`/jobs/save/${job.id}`);
        setSaved(true); onSaveToggle?.(job.id, true);
        toast('Saved');
      }
    } finally { setSavingJob(false); }
  };

  const handleTrack = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (tracked) return;
    try {
      await api.post('/applications', { jobId: job.id, status: 'Applied' });
      setTracked(true); toast('Added to tracker');
    } catch { setTracked(true); toast('Already tracked', 'info'); }
  };

  const color = avatarColor(job.company);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-gray-200 border border-gray-300 rounded p-4 hover:border-gray-400 hover:bg-gray-200/80 transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Company avatar */}
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{ backgroundColor: color + '22', color }}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate leading-tight">{job.company}</p>
            <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-sm inline-block mt-0.5', PORTAL_COLORS[job.portal] || 'bg-gray-300 text-gray-600')}>
              {job.portal}
            </span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={savingJob}
          className={cn('p-1.5 rounded transition-colors shrink-0', saved ? 'text-primary-400' : 'text-gray-500 hover:text-primary-400')}
        >
          {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug mb-2">
        {job.title}
      </h3>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-3">
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin size={10} className="shrink-0" />{job.location}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <Briefcase size={10} className="shrink-0" />{job.jobType}
        </span>
        {job.salary && (
          <span className="text-xs text-emerald-400 font-medium">{formatSalary(job.salary)}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-300">
        <span className="text-[11px] text-gray-500">{formatDate(job.postedAt)}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTrack}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-[11px] font-medium border rounded transition-colors',
              tracked
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            )}
          >
            {tracked ? <Check size={11} /> : <Plus size={11} />}
            {tracked ? 'Tracked' : 'Track'}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors"
          >
            Apply <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </Link>
  );
}
