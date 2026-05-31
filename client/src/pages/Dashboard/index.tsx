import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Briefcase, Clock } from 'lucide-react';
import api from '../../lib/axios';
import type { JobFilters, JobsResponse } from '../../types';
import JobCard from './JobCard';
import JobFiltersPanel from './JobFilters';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const DEFAULT_FILTERS: JobFilters = { page: 1 };

export default function Dashboard() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryKey = ['jobs', filters, search];

  const { data, isLoading, isError, refetch } = useQuery<JobsResponse>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.portal) params.set('portal', filters.portal);
      if (filters.location) params.set('location', filters.location);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.datePosted) params.set('datePosted', filters.datePosted);
      if (search) params.set('search', search);
      params.set('page', String(filters.page || 1));
      params.set('limit', '12');
      return api.get(`/jobs?${params}`).then(r => r.data);
    },
    staleTime: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.post('/jobs/refresh').then(r => r.data),
    onSuccess: () => {
      setLastRefreshed(new Date());
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleFiltersChange = useCallback((f: JobFilters) => setFilters(f), []);
  const handleReset = useCallback(() => { setFilters(DEFAULT_FILTERS); setSearch(''); }, []);

  const handleSaveToggle = (id: string, saved: boolean) => {
    qc.setQueryData<JobsResponse>(queryKey, prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j => j.id === id ? { ...j, isSaved: saved } : j),
      };
    });
  };

  const jobs = data?.jobs || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} jobs found` : 'Browse all available jobs'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              Refreshed {Math.round((Date.now() - lastRefreshed.getTime()) / 60000) || 0}m ago
            </span>
          )}
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw size={15} className={refreshMutation.isPending ? 'animate-spin' : ''} />
            {refreshMutation.isPending ? 'Refreshing…' : 'Refresh Jobs'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          placeholder="Search by title, company, or skill…"
        />
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar — desktop */}
        <div className="hidden lg:block">
          <JobFiltersPanel filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
        </div>

        {/* Jobs grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="lg:hidden mb-4 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <Search size={14} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {showFilters && (
            <div className="lg:hidden mb-4 p-4 bg-white border border-gray-200 rounded-xl">
              <JobFiltersPanel filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner fullPage />
          ) : isError ? (
            <ErrorState message="Failed to load jobs" onRetry={() => refetch()} />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Try adjusting your filters or search term."
              action={
                <button onClick={handleReset} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onSaveToggle={handleSaveToggle} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                    disabled={(filters.page || 1) <= 1}
                    className="px-4 py-2 border border-gray-300 text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setFilters(f => ({ ...f, page }))}
                        className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                          (filters.page || 1) === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setFilters(f => ({ ...f, page: Math.min(pages, (f.page || 1) + 1) }))}
                    disabled={(filters.page || 1) >= pages}
                    className="px-4 py-2 border border-gray-300 text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
