import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, Briefcase, IndianRupee, Calendar, ExternalLink,
  Bookmark, BookmarkCheck, ClipboardList, Building2, Globe
} from 'lucide-react';
import api from '../lib/axios';
import type { Job, Application } from '../types';
import { cn, PORTAL_COLORS, formatDate, formatSalary } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [trackMsg, setTrackMsg] = useState('');

  const { data: job, isLoading, isError } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => {
      const j = r.data;
      if (saved === null) setSaved(j.isSaved ?? false);
      return j;
    }),
  });

  const isSaved = saved !== null ? saved : (job?.isSaved ?? false);

  const handleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await api.delete(`/jobs/save/${job.id}`);
        setSaved(false);
      } else {
        await api.post(`/jobs/save/${job.id}`);
        setSaved(true);
      }
    } catch { /* ignore */ }
  };

  const trackMutation = useMutation({
    mutationFn: () => api.post('/applications', { jobId: id, status: 'Applied' }).then(r => r.data as Application),
    onSuccess: () => {
      setTrackMsg('Added to tracker!');
      qc.invalidateQueries({ queryKey: ['applications'] });
      setTimeout(() => setTrackMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setTrackMsg(msg || 'Already tracking this job');
      setTimeout(() => setTrackMsg(''), 3000);
    },
  });

  // Extract skills from description (simple heuristic)
  const extractSkills = (description: string): string[] => {
    const skills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
      'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis',
      'GraphQL', 'REST', 'Git', 'CI/CD', 'TensorFlow', 'PyTorch', 'Machine Learning',
      'Spring', 'Django', 'Flask', 'Next.js', 'Vue', 'Angular', 'Kotlin', 'Swift',
    ];
    return skills.filter(s => description.toLowerCase().includes(s.toLowerCase()));
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (isError || !job) return <ErrorState message="Job not found" onRetry={() => navigate('/')} />;

  const detectedSkills = extractSkills(job.description);

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to jobs
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', PORTAL_COLORS[job.portal] || 'bg-gray-100 text-gray-600')}>
                  {job.portal}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11} />
                  Posted {formatDate(job.postedAt)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-lg text-gray-700 font-medium">{job.company}</p>
            </div>
            <button
              onClick={handleSave}
              className={cn(
                'p-2 rounded-xl transition-colors mt-1',
                isSaved ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
              )}
            >
              {isSaved ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400" />
              {job.location}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Briefcase size={14} className="text-gray-400" />
              {job.jobType}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <IndianRupee size={14} className="text-gray-400" />
              {formatSalary(job.salary)}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mt-5">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Apply Now
              <ExternalLink size={15} />
            </a>
            <button
              onClick={() => trackMutation.mutate()}
              disabled={trackMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <ClipboardList size={15} />
              {trackMutation.isPending ? 'Adding…' : 'Track Application'}
            </button>
          </div>
          {trackMsg && (
            <p className={cn('text-sm mt-2', trackMsg.includes('Already') ? 'text-amber-600' : 'text-green-600')}>
              {trackMsg}
            </p>
          )}
        </div>

        {/* Company info */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Company</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
              {job.company.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{job.company}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Building2 size={11} />
                  Technology
                </span>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                  <Globe size={11} />
                  View on {job.portal}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {detectedSkills.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {detectedSkills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Job Description</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {job.description.split('\n').map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to all jobs
        </Link>
      </div>
    </div>
  );
}
