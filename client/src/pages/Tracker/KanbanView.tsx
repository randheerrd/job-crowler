import { Trash2, ExternalLink, ArrowRight } from 'lucide-react';
import { cn, PORTAL_COLORS, APPLICATION_STATUSES } from '../../lib/utils';
import api from '../../lib/axios';
import type { Application, ApplicationStatus } from '../../types';

interface Props {
  applications: Application[];
  onUpdated: (app: Application) => void;
  onDeleted: (id: string) => void;
}

const COLUMN_COLORS: Record<string, string> = {
  Saved:                'bg-slate-100 border-slate-200 text-slate-600',
  Applied:              'bg-blue-50 border-blue-200 text-blue-700',
  'Interview Scheduled':'bg-amber-50 border-amber-200 text-amber-700',
  'Offer Received':     'bg-emerald-50 border-emerald-200 text-emerald-700',
  Rejected:             'bg-red-50 border-red-200 text-red-600',
  Withdrawn:            'bg-gray-50 border-gray-200 text-gray-500',
};

function getTitle(app: Application): string {
  return app.job?.title || app.manualJob?.title || 'Unknown Position';
}

function getCompany(app: Application): string {
  return app.job?.company || app.manualJob?.company || '—';
}

function getUrl(app: Application): string | null {
  return app.job?.url || app.manualJob?.url || null;
}

interface KanbanCardProps {
  app: Application;
  onUpdated: (a: Application) => void;
  onDeleted: (id: string) => void;
}

function KanbanCard({ app, onUpdated, onDeleted }: KanbanCardProps) {
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
  const url = getUrl(app);
  const portal = app.job?.portal;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card hover:shadow-card-hover transition-shadow group/card relative">
      {/* Delete button — hidden until hover */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 leading-snug pr-6 mb-0.5">{getTitle(app)}</p>

      {/* Company */}
      <p className="text-xs text-gray-500 mb-2.5">{getCompany(app)}</p>

      {/* Portal badge */}
      {portal && (
        <span className={cn('inline-block text-xs px-2 py-0.5 rounded-full mb-2.5 font-medium', PORTAL_COLORS[portal] || 'bg-gray-100 text-gray-600')}>
          {portal}
        </span>
      )}

      {/* Notes preview */}
      {app.notes && (
        <p className="text-xs text-gray-400 italic mb-2.5 line-clamp-1">{app.notes}</p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ExternalLink size={11} />
            Open
          </a>
        ) : (
          <span />
        )}
        {nextStatus && (
          <button
            onClick={() => handleMove(nextStatus)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-full hover:border-primary-500/40 hover:text-primary-400 transition-all"
          >
            Next
            <ArrowRight size={11} />
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
        <div key={status} className="w-72 shrink-0">
          {/* Column header */}
          <div className={cn(
            'rounded-xl border px-3 py-2 mb-3 flex items-center justify-between',
            COLUMN_COLORS[status] || 'bg-gray-100 border-gray-200 text-gray-600'
          )}>
            <span className="text-xs font-semibold">{status}</span>
            <span className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded-full',
              apps.length > 0 ? 'bg-white/20' : 'opacity-60'
            )}>
              {apps.length}
            </span>
          </div>

          {/* Column body */}
          <div className="space-y-2 min-h-[200px]">
            {apps.length === 0 && (
              <div className="flex items-center justify-center h-16 text-xs text-gray-300 border border-dashed border-gray-200 rounded-xl">
                Empty
              </div>
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
