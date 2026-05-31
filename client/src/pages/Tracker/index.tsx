import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Table2, LayoutGrid, ClipboardList } from 'lucide-react';
import api from '../../lib/axios';
import type { Application, ApplicationStatus } from '../../types';
import TableView from './TableView';
import KanbanView from './KanbanView';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { APPLICATION_STATUSES } from '../../lib/utils';
import AddApplicationModal from './AddApplicationModal';

type ViewMode = 'table' | 'kanban';

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

  const handleUpdated = (updated: Application) => {
    qc.setQueryData<Application[]>(['applications', statusFilter], prev =>
      prev?.map(a => a.id === updated.id ? updated : a) || []
    );
    // Invalidate all application queries
    qc.invalidateQueries({ queryKey: ['applications'] });
  };

  const handleDeleted = (id: string) => {
    qc.setQueryData<Application[]>(['applications', statusFilter], prev =>
      prev?.filter(a => a.id !== id) || []
    );
  };

  const handleAdded = (app: Application) => {
    qc.invalidateQueries({ queryKey: ['applications'] });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} application{applications.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Table2 size={13} />
              Table
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={13} />
              Kanban
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            Add Manual Entry
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {APPLICATION_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              s === statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : isError ? (
        <ErrorState message="Failed to load applications" onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Start tracking jobs by clicking 'Track Application' on any job listing, or add a manual entry."
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              Add Manual Entry
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
