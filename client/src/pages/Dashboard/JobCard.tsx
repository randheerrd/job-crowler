import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Bookmark, BookmarkCheck, ExternalLink, Plus } from 'lucide-react';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../../lib/utils';
import api from '../../lib/axios';
import type { Job } from '../../types';
import { useToastStore } from '../../store/toastStore';

interface Props {
  job: Job;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-teal-500',
];

function companyColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function JobCard({ job, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [savingJob, setSavingJob] = useState(false);
  const [tracking, setTracking] = useState(false);
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
        toast('Job removed from saved');
      } else {
        await api.post(`/jobs/save/${job.id}`);
        setSaved(true);
        onSaveToggle?.(job.id, true);
        toast('Job saved!');
      }
    } finally {
      setSavingJob(false);
    }
  };

  const handleTrack = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tracking) return;
    setTracking(true);
    try {
      await api.post('/applications', { jobId: job.id, status: 'Applied' });
      toast('Added to your tracker!');
    } catch {
      toast('Already in your tracker', 'info');
    } finally {
      setTracking(false);
    }
  };

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group"
    >
      {/* Company row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0', companyColor(job.company))}>
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{job.company}</p>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5', PORTAL_COLORS[job.portal] || 'bg-gray-100 text-gray-600')}>
              {job.portal}
            </span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={savingJob}
          className={cn(
            'p-2 rounded-xl transition-all shrink-0',
            saved
              ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
              : 'text-slate-300 hover:text-primary-500 hover:bg-primary-50'
          )}
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>
      </div>

      {/* Job title */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-1">
        {job.title}
      </h3>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 mt-2">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={11} className="text-slate-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Briefcase size={11} className="text-slate-400" />
          {job.jobType}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <IndianRupee size={11} />
            {formatSalary(job.salary)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{formatDate(job.postedAt)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTrack}
            disabled={tracking}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Plus size={11} />
            Track
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </Link>
  );
}
