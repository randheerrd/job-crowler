import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Briefcase, Bookmark, TrendingUp, Users, Sparkles } from 'lucide-react';
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
      toast(added > 0 ? `${added} new jobs found!` : 'You\'re up to date', added > 0 ? 'success' : 'info');
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

  const chipClass = (active: boolean) => cn(
    'px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap shrink-0 cursor-pointer',
    active
      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
  );

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-12 translate-y-12" />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Sparkles size={13} />
              Hey {firstName}!
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">Find your next opportunity</h1>
            <p className="text-primary-200 text-sm">
              {total > 0 ? `${total} jobs aggregated across all portals` : 'Refresh to discover live job listings'}
            </p>
          </div>
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary-700 text-sm font-semibold rounded-xl hover:bg-primary-50 disabled:opacity-70 transition-colors shrink-0"
          >
            <RefreshCw size={15} className={refreshMutation.isPending ? 'animate-spin' : ''} />
            {refreshMutation.isPending ? 'Fetching…' : 'Refresh Jobs'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Jobs Available', value: total, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
          { label: 'Tracked', value: applications.length, icon: TrendingUp, color: 'bg-primary-50 text-primary-600' },
          { label: 'Interviews', value: interviewCount, icon: Users, color: 'bg-amber-50 text-amber-600' },
          { label: 'Saved', value: savedCount, icon: Bookmark, color: 'bg-emerald-50 text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-card">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          placeholder="Search by title, company, or skill…"
        />
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PORTAL_OPTIONS.map(p => (
            <button key={p} onClick={() => handlePortalChip(p)} className={chipClass(selectedPortal === p)}>{p}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {JOB_TYPE_OPTIONS.map(t => (
            <button key={t} onClick={() => handleJobTypeChip(t)} className={chipClass(selectedJobType === t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Jobs grid */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : isError ? (
        <ErrorState message="Could not load jobs" onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={total === 0 ? 'No jobs yet' : 'No results'}
          description={total === 0 ? 'Hit "Refresh Jobs" to pull live listings from job portals.' : 'Try a different search or clear your filters.'}
          action={
            total === 0 ? (
              <button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={15} className={refreshMutation.isPending ? 'animate-spin' : ''} />
                Refresh Jobs
              </button>
            ) : (
              <button onClick={handleReset} className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Clear filters
              </button>
            )
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
                className="px-4 py-2 border border-slate-200 bg-white text-sm rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setFilters(f => ({ ...f, page }))}
                  className={cn(
                    'w-9 h-9 text-sm rounded-lg transition-colors font-medium',
                    (filters.page || 1) === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setFilters(f => ({ ...f, page: Math.min(pages, (f.page || 1) + 1) }))}
                disabled={(filters.page || 1) >= pages}
                className="px-4 py-2 border border-slate-200 bg-white text-sm rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
