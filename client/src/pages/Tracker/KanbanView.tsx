import { Trash2, ExternalLink } from 'lucide-react';
import { cn, STATUS_COLORS, APPLICATION_STATUSES } from '../../lib/utils';
import api from '../../lib/axios';
import type { Application, ApplicationStatus } from '../../types';

interface Props {
  applications: Application[];
  onUpdated: (app: Application) => void;
  onDeleted: (id: string) => void;
}

function getTitle(app: Application): string {
  return app.job?.title || app.manualJob?.title || 'Unknown Position';
}

function getCompany(app: Application): string {
  return app.job?.company || app.manualJob?.company || '—';
}

function getUrl(app: Application): string | null {
  return app.job?.url || app.manualJob?.url || null;
}

function KanbanCard({ app, onUpdated, onDeleted }: { app: Application; onUpdated: (a: Application) => void; onDeleted: (id: string) => void }) {
  const handleMove = async (status: ApplicationStatus) => {
    try {
      const { data } = await api.put(`/applications/${app.id}`, { status });
      onUpdated(data);
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/applications/${app.id}`);
      onDeleted(app.id);
    } catch { /* ignore */ }
  };

  const nextStatus = APPLICATION_STATUSES[APPLICATION_STATUSES.indexOf(app.status) + 1] as ApplicationStatus | undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-gray-900 leading-tight">{getTitle(app)}</p>
        <button onClick={handleDelete} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">{getCompany(app)}</p>
      {app.job?.portal && (
        <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2">{app.job.portal}</span>
      )}
      {app.notes && (
        <p className="text-xs text-gray-400 italic mb-2 line-clamp-2">{app.notes}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        {getUrl(app) && (
          <a href={getUrl(app)!} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
            View <ExternalLink size={10} />
          </a>
        )}
        {nextStatus && (
          <button
            onClick={() => handleMove(nextStatus)}
            className="text-xs text-gray-500 hover:text-primary-600 ml-auto"
          >
            Move to {nextStatus} →
          </button>
        )}
      </div>
    </div>
  );
}

export default function KanbanView({ applications, onUpdated, onDeleted }: Props) {
  const byStatus = APPLICATION_STATUSES.map(status => ({
    status,
    apps: applications.filter(a => a.status === status),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {byStatus.map(({ status, apps }) => (
        <div key={status} className="shrink-0 w-56">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[status] || 'bg-gray-100 text-gray-700')}>
                {status}
              </span>
              <span className="text-xs text-gray-400">{apps.length}</span>
            </div>
          </div>
          <div className="space-y-2 min-h-[100px] bg-gray-50 rounded-xl p-2">
            {apps.length === 0 && (
              <div className="flex items-center justify-center h-16 text-xs text-gray-300">Empty</div>
            )}
            {apps.map(app => (
              <KanbanCard key={app.id} app={app} onUpdated={onUpdated} onDeleted={onDeleted} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
