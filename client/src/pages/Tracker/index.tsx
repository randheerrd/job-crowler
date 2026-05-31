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
import { cn, APPLICATION_STATUSES } from '../../lib/utils';
import AddApplicationModal from './AddApplicationModal';

type ViewMode = 'table' | 'kanban';

const STATUS_COLORS: Record<string, string> = {
  Saved:                'bg-gray-400/10 border-gray-400/20 text-gray-600',
  Applied:              'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'Interview Scheduled':'bg-amber-500/10 border-amber-500/20 text-amber-400',
  'Offer Received':     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Rejected:             'bg-red-500/10 border-red-500/20 text-red-400',
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Applications</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {allApplications.length} application{allApplications.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition-colors"
        >
          <Plus size={13} />
          Add entry
        </button>
      </div>

      {/* Controls: view + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center border border-gray-300 rounded overflow-hidden shrink-0">
          <button
            onClick={() => setView('table')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium transition-colors',
              view === 'table' ? 'bg-gray-300 text-gray-900' : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <Table2 size={12} /> Table
          </button>
          <div className="w-px h-4 bg-gray-300" />
          <button
            onClick={() => setView('kanban')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium transition-colors',
              view === 'kanban' ? 'bg-gray-300 text-gray-900' : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <LayoutGrid size={12} /> Kanban
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setStatusFilter('')}
            className={cn(
              'px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0',
              !statusFilter
                ? 'bg-primary-500/15 border-primary-500/25 text-primary-400'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            )}
          >
            All
          </button>
          {APPLICATION_STATUSES.map(s => {
            const count = allApplications.filter(a => a.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0',
                  s === statusFilter
                    ? 'bg-primary-500/15 border-primary-500/25 text-primary-400'
                    : cn('border', STATUS_COLORS[s] || 'border-gray-300 text-gray-600')
                )}
              >
                {s}
                <span className="font-semibold">{count}</span>
              </button>
            );
          })}
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
          description="Start tracking from job listings, or add a manual entry."
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition-colors"
            >
              <Plus size={13} />
              Add entry
            </button>
          }
        />
      ) : (
        <div className="bg-gray-200 border border-gray-300 rounded overflow-hidden">
          {view === 'table' ? (
            <TableView applications={applications} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ) : (
            <div className="p-4">
              <KanbanView applications={applications} onUpdated={handleUpdated} onDeleted={handleDeleted} />
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddApplicationModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}
