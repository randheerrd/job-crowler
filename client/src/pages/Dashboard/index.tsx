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
      toast(added > 0 ? `${added} new jobs added` : "You're up to date", added > 0 ? 'success' : 'info');
    },
    onError: () => toast('Failed to refresh jobs', 'error'),
  });

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS); setSearch('');
    setSelectedPortal('All'); setSelectedJobType('All Types');
  }, []);

  const handleSaveToggle = (id: string, saved: boolean) => {
    qc.setQueryData<JobsResponse>(queryKey, prev =>
      prev ? { ...prev, jobs: prev.jobs.map(j => j.id === id ? { ...j, isSaved: saved } : j) } : prev
    );
  };

  const handlePortalChip = (p: string) => {
    setSelectedPortal(p);
    setFilters(f => ({ ...f, portal: p === 'All' ? undefined : p, page: 1 }));
  };

  const handleJobTypeChip = (t: string) => {
    setSelectedJobType(t);
    setFilters(f => ({ ...f, jobType: t === 'All Types' ? undefined : t, page: 1 }));
  };

  const jobs = data?.jobs || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const chip = (active: boolean) => cn(
    'px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer',
    active
      ? 'bg-primary-600/15 border-primary-500/30 text-primary-400'
      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-1 border-b border-gray-300">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Discover Jobs</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Hey {firstName} — {total > 0 ? `${total} jobs available` : 'refresh to load listings'}
          </p>
        </div>
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 disabled:opacity-60 transition-colors shrink-0"
        >
          <RefreshCw size={13} className={refreshMutation.isPending ? 'animate-spin' : ''} />
          {refreshMutation.isPending ? 'Fetching…' : 'Refresh'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {[
          { label: 'Jobs',        value: total,                              icon: Briefcase,  cls: 'text-blue-400' },
          { label: 'Tracked',     value: applications.length,               icon: TrendingUp, cls: 'text-primary-400' },
          { label: 'Interviews',  value: applications.filter(a => a.status === 'Interview Scheduled').length, icon: Users, cls: 'text-amber-400' },
          { label: 'Saved',       value: jobs.filter(j => j.isSaved).length, icon: Bookmark,  cls: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-gray-200 border border-gray-300 rounded p-3 flex items-center gap-2.5">
            <Icon size={15} className={cls} />
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
          className="w-full pl-9 pr-3 py-2 text-sm"
          placeholder="Search by title, company, skill…"
        />
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PORTAL_OPTIONS.map(p => <button key={p} onClick={() => handlePortalChip(p)} className={chip(selectedPortal === p)}>{p}</button>)}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {JOB_TYPE_OPTIONS.map(t => <button key={t} onClick={() => handleJobTypeChip(t)} className={chip(selectedJobType === t)}>{t}</button>)}
        </div>
      </div>

      {/* Jobs */}
      {isLoading ? <LoadingSpinner fullPage />
        : isError ? <ErrorState message="Could not load jobs" onRetry={() => refetch()} />
        : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={total === 0 ? 'No jobs yet' : 'No results'}
            description={total === 0 ? 'Click Refresh to pull live listings.' : 'Try different filters.'}
            action={
              <button
                onClick={total === 0 ? () => refreshMutation.mutate() : handleReset}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={13} className={refreshMutation.isPending ? 'animate-spin' : ''} />
                {total === 0 ? 'Refresh Jobs' : 'Clear filters'}
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {jobs.map(job => <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />)}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-1.5 py-4">
                <button
                  onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  disabled={(filters.page || 1) <= 1}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded disabled:opacity-40 hover:bg-gray-200 transition-colors"
                >Prev</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                    className={cn('w-8 h-8 text-xs rounded transition-colors font-medium',
                      (filters.page || 1) === page ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
                    )}>{page}</button>
                ))}
                <button
                  onClick={() => setFilters(f => ({ ...f, page: Math.min(pages, (f.page || 1) + 1) }))}
                  disabled={(filters.page || 1) >= pages}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded disabled:opacity-40 hover:bg-gray-200 transition-colors"
                >Next</button>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}
