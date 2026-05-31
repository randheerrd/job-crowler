import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Check, Plus, ArrowUpRight } from 'lucide-react';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../../lib/utils';
import api from '../../lib/axios';
import type { Job } from '../../types';
import { useToastStore } from '../../store/toastStore';

const AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#06b6d4','#f97316','#6366f1',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

interface Props {
  job: Job;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export default function JobRow({ job, onSaveToggle }: Props) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [savingJob, setSavingJob] = useState(false);
  const [tracked, setTracked] = useState(false);
  const { toast } = useToastStore();
  const color = avatarColor(job.company);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    e.stopPropagation();
    if (tracked) return;
    try {
      await api.post('/applications', { jobId: job.id, status: 'Applied' });
      setTracked(true); toast('Added to tracker');
    } catch { setTracked(true); toast('Already tracked', 'info'); }
  };

  return (
    <tr className="group cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
      {/* Bookmark */}
      <td className="w-8 pl-3 pr-0">
        <button
          onClick={handleSave}
          disabled={savingJob}
          className={cn('p-1 rounded transition-colors', saved ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700')}
        >
          {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
        </button>
      </td>

      {/* Company */}
      <td className="w-44">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: color + '22', color }}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-800 truncate font-medium text-xs">{job.company}</span>
        </div>
      </td>

      {/* Title */}
      <td className="min-w-[200px] max-w-xs">
        <span className="text-gray-900 font-medium group-hover:text-primary-400 transition-colors line-clamp-1">
          {job.title}
        </span>
      </td>

      {/* Location */}
      <td className="w-36 text-gray-600 text-xs truncate hidden lg:table-cell">
        {job.location}
      </td>

      {/* Type */}
      <td className="w-24 hidden xl:table-cell">
        <span className="text-[11px] text-gray-600 bg-gray-300/40 px-1.5 py-0.5 rounded whitespace-nowrap">
          {job.jobType}
        </span>
      </td>

      {/* Portal */}
      <td className="w-28 hidden lg:table-cell">
        <span className={cn('text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap', PORTAL_COLORS[job.portal] || 'bg-gray-300/30 text-gray-600')}>
          {job.portal}
        </span>
      </td>

      {/* Salary */}
      <td className="w-32 hidden xl:table-cell">
        {job.salary ? (
          <span className="text-xs text-emerald-400 font-medium">{formatSalary(job.salary)}</span>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>

      {/* Date */}
      <td className="w-20 text-gray-500 text-xs whitespace-nowrap hidden sm:table-cell">
        {formatDate(job.postedAt)}
      </td>

      {/* Actions */}
      <td className="w-28 pr-3">
        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleTrack}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-[11px] font-medium border rounded transition-colors',
              tracked
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
            )}
          >
            {tracked ? <Check size={10} /> : <Plus size={10} />}
            {tracked ? 'Tracked' : 'Track'}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            Apply <ArrowUpRight size={10} />
          </a>
        </div>
      </td>
    </tr>
  );
}
