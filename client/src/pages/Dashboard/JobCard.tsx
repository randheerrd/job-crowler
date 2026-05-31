import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Bookmark, BookmarkCheck, ExternalLink, Calendar } from 'lucide-react';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../../lib/utils';
import api from '../../lib/axios';
import type { Job } from '../../types';

interface Props {
  job: Job;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export default function JobCard({ job, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [savingJob, setSavingJob] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      }
    } finally {
      setSavingJob(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', PORTAL_COLORS[job.portal] || 'bg-gray-100 text-gray-600')}>
              {job.portal}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(job.postedAt)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={savingJob}
          className={cn(
            'p-1.5 rounded-lg transition-colors shrink-0 mt-0.5',
            saved ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
          )}
          title={saved ? 'Unsave job' : 'Save job'}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Briefcase size={12} />
          {job.jobType}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <IndianRupee size={12} />
          {formatSalary(job.salary)}
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

      <div className="flex gap-2">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 py-2 text-center text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
        >
          View Details
        </Link>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Apply
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
