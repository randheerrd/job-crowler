import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Briefcase, Bookmark, TrendingUp, Users } from 'lucide-react';
import api from '../../lib/axios';
import type { JobFilters, JobsResponse, Application } from '../../types';
import JobCard from './JobCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { cn, PORTALS, JOB_TYPES } from '../../lib/utils';
import { useToastStore } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';

const DEFAULT_FILTERS: JobFilters = { page: 1 };
const PORTAL_OPTIONS = ['All', ...PORTALS, 'Remotive'];
const JOB_TYPE_OPTIONS = ['All Types', ...JOB_TYPES];

export default function Dashboard() {
  const qc = useQueryClient();
  const { toast } = useToastStore();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [selectedPortal, setSelectedPortal] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All Types');

  const queryKey = ['jobs', filters, search];

  const { data, isLoading, isError, refetch } = useQuery<JobsResponse>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.portal) params.set('portal', filters.portal);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (search) params.set('search', search);
      params.set('page', String(filters.page || 1));
      params.set('limit', '12');
      return api.get(`/jobs?${params}`).then(r => r.data);
    },
    staleTime: 30_000,
  });

  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ['applications', ''],
    queryFn: () => api.get('/applications').then(r => r.data),
    staleTime: 60_000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.post('/jobs/refresh').then(r => r.data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      const added = result.added ?? 0;
      toast(added > 0 ? `${added} new jobs found!` : "You're all caught up", added > 0 ? 'success' : 'info');
    },
    onError: () => toast('Could not fetch jobs right now', 'error'),
  });

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setSelectedPortal('All');
    setSelectedJobType('All Types');
  }, []);

  const handleSaveToggle = (id: string, saved: boolean) => {
    qc.setQueryData<JobsResponse>(queryKey, prev =>
      prev ? { ...prev, jobs: prev.jobs.map(j => j.id === id ? { ...j, isSaved: saved } : j) } : prev
    );
  };

  const handlePortalChip = (portal: string) => {
    setSelectedPortal(portal);
    setFilters(f => ({ ...f, portal: portal === 'All' ? undefined : portal, page: 1 }));
  };

  const handleJobTypeChip = (jobType: string) => {
    setSelectedJobType(jobType);
    setFilters(f => ({ ...f, jobType: jobType === 'All Types' ? undefined : jobType, page: 1 }));
  };

  const jobs = data?.jobs || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;
  const interviewCount = applications.filter(a => a.status === 'Interview Scheduled').length;
  const savedCount = jobs.filter(j => j.isSaved).length;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const chip = (active: boolean) => cn(
    'px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer',
    active
      ? 'bg-primary-600/20 border-primary-500/40 text-primary-400'
      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 bg-transparent'
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1065 50%, #1a0a2e 100%)' }}>
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#9333ea' }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: '#d946ef' }} />

        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-primary-300 text-sm font-semibold mb-2 tracking-wide">
              Welcome back, {firstName} 👋
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight mb-2">
              Find your next<br />
              <span className="gradient-text">opportunity</span>
            </h1>
            <p className="text-gray-600 text-sm">
              {total > 0 ? `${total} jobs aggregated from all portals` : 'Hit refresh to pull live listings'}
            </p>
          </div>
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white gradient-btn shadow-glow disabled:opacity-60 transition-all shrink-0"
          >
            <RefreshCw size={15} className={refreshMutation.isPending ? 'animate-spin' : ''} />
            {refreshMutation.isPending ? 'Fetching…' : 'Refresh Jobs'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Jobs Available',   value: total,                icon: Briefcase,   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Tracked',          value: applications.length,  icon: TrendingUp,  color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Interviews',       value: interviewCount,       icon: Users,       color: 'text-amber-400',   bg: 'bg-amber-500/10' },
          { label: 'Saved',            value: savedCount,           icon: Bookmark,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-300 p-4 flex items-center gap-3 shadow-card">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-600 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          placeholder="Search by title, company, skill…"
        />
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PORTAL_OPTIONS.map(p => (
            <button key={p} onClick={() => handlePortalChip(p)} className={chip(selectedPortal === p)}>{p}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {JOB_TYPE_OPTIONS.map(t => (
            <button key={t} onClick={() => handleJobTypeChip(t)} className={chip(selectedJobType === t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Jobs */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : isError ? (
        <ErrorState message="Could not load jobs" onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={total === 0 ? 'No jobs yet' : 'No results'}
          description={total === 0 ? 'Hit Refresh Jobs to pull live listings.' : 'Try different filters or clear search.'}
          action={
            <button
              onClick={total === 0 ? () => refreshMutation.mutate() : handleReset}
              disabled={total === 0 && refreshMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white gradient-btn shadow-glow disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshMutation.isPending ? 'animate-spin' : ''} />
              {total === 0 ? 'Refresh Jobs' : 'Clear filters'}
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {jobs.map(job => <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />)}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                disabled={(filters.page || 1) <= 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl disabled:opacity-40 hover:bg-gray-200 transition-colors"
              >Previous</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setFilters(f => ({ ...f, page }))}
                  className={cn(
                    'w-9 h-9 text-sm rounded-xl transition-colors font-semibold',
                    (filters.page || 1) === page
                      ? 'gradient-btn text-white shadow-glow-sm'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
                  )}
                >{page}</button>
              ))}
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.min(pages, (f.page || 1) + 1) }))}
                disabled={(filters.page || 1) >= pages}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl disabled:opacity-40 hover:bg-gray-200 transition-colors"
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
