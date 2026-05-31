import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Table2, LayoutGrid, ClipboardList } from 'lucide-react';
import api from '../../lib/axios';
import type { Application } from '../../types';
import TableView from './TableView';
import KanbanView from './KanbanView';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { cn, APPLICATION_STATUSES, STATUS_COLORS } from '../../lib/utils';
import AddApplicationModal from './AddApplicationModal';

type ViewMode = 'table' | 'kanban';

const STATUS_PILL_COLORS: Record<string, string> = {
  Saved:                'bg-gray-400/10 border-gray-400/20 text-gray-600',
  Applied:              'bg-blue-500/15 border-blue-500/25 text-blue-400',
  'Interview Scheduled':'bg-amber-500/15 border-amber-500/25 text-amber-400',
  'Offer Received':     'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
  Rejected:             'bg-red-500/15 border-red-500/25 text-red-400',
  Withdrawn:            'bg-gray-400/10 border-gray-400/20 text-gray-500',
};

export default function Tracker() {
  const [view, setView] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();

  const { data: applications = [], isLoading, isError, refetch } = useQuery<Application[]>({
    queryKey: ['applications', statusFilter],
    queryFn: () => {
      const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
      return api.get(`/applications${params}`).then(r => r.data);
    },
  });

  // Use unfiltered applications for stats
  const { data: allApplications = [] } = useQuery<Application[]>({
    queryKey: ['applications', ''],
    queryFn: () => api.get('/applications').then(r => r.data),
    staleTime: 30_000,
  });

  const handleUpdated = (updated: Application) => {
    qc.setQueryData<Application[]>(['applications', statusFilter], prev =>
      prev?.map(a => a.id === updated.id ? updated : a) || []
    );
    qc.invalidateQueries({ queryKey: ['applications'] });
  };

  const handleDeleted = (id: string) => {
    qc.setQueryData<Application[]>(['applications', statusFilter], prev =>
      prev?.filter(a => a.id !== id) || []
    );
  };

  const handleAdded = (_app: Application) => {
    qc.invalidateQueries({ queryKey: ['applications'] });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {allApplications.length} application{allApplications.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Stats pills */}
      <div className="flex flex-wrap gap-2">
        {APPLICATION_STATUSES.map(s => {
          const count = allApplications.filter(a => a.status === s).length;
          return (
            <span
              key={s}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
                STATUS_PILL_COLORS[s] || 'bg-gray-100 text-gray-600 border-gray-200'
              )}
            >
              {s}
              <span className="font-bold">{count}</span>
            </span>
          );
        })}
      </div>

      {/* Controls row: view toggle + status filter chips */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setView('table')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Table2 size={13} />
            Table
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <LayoutGrid size={13} />
            Kanban
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0',
              !statusFilter
                ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400'
                : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            All
          </button>
          {APPLICATION_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0',
                s === statusFilter
                  ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400'
                  : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : isError ? (
        <ErrorState message="Failed to load applications" onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Start tracking jobs by clicking 'Track' on any job listing, or add a manual entry."
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              Add Entry
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {view === 'table' ? (
            <TableView applications={applications} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ) : (
            <KanbanView applications={applications} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          )}
        </div>
      )}

      {showAdd && (
        <AddApplicationModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
