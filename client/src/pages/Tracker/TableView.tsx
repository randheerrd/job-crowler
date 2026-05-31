import { useState } from 'react';
import { Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { cn, STATUS_COLORS, formatDate, APPLICATION_STATUSES } from '../../lib/utils';
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

function getPortal(app: Application): string {
  return app.job?.portal || 'Manual';
}

export default function TableView({ applications, onUpdated, onDeleted }: Props) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleStatusChange = async (app: Application, status: ApplicationStatus) => {
    try {
      const { data } = await api.put(`/applications/${app.id}`, { status });
      onUpdated(data);
    } catch { /* ignore */ }
  };

  const handleSaveNotes = async (app: Application) => {
    try {
      const { data } = await api.put(`/applications/${app.id}`, { notes: notesDraft });
      onUpdated(data);
      setEditingNotes(null);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      await api.delete(`/applications/${id}`);
      onDeleted(id);
      setConfirmDelete(null);
    } catch { /* ignore */ }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">No applications found.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Position</th>
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Company</th>
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Source</th>
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Applied</th>
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Status</th>
            <th className="text-left font-medium text-gray-500 pb-3 pr-4">Notes</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map(app => (
            <tr key={app.id} className="group hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{getTitle(app)}</span>
                  {getUrl(app) && (
                    <a href={getUrl(app)!} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-600">{getCompany(app)}</td>
              <td className="py-3 pr-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPortal(app)}</span>
              </td>
              <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(app.dateApplied)}</td>
              <td className="py-3 pr-4">
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500',
                    STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'
                  )}
                >
                  {APPLICATION_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="py-3 pr-4 max-w-[200px]">
                {editingNotes === app.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={notesDraft}
                      onChange={e => setNotesDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveNotes(app);
                        if (e.key === 'Escape') setEditingNotes(null);
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                    />
                    <button onClick={() => handleSaveNotes(app)} className="text-green-600 hover:text-green-800"><Check size={12} /></button>
                    <button onClick={() => setEditingNotes(null)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 cursor-pointer group/notes"
                    onClick={() => { setEditingNotes(app.id); setNotesDraft(app.notes || ''); }}
                  >
                    <span className={cn('text-xs truncate', app.notes ? 'text-gray-600' : 'text-gray-300 italic')}>
                      {app.notes || 'Add notes…'}
                    </span>
                    <Edit2 size={10} className="shrink-0 text-gray-300 group-hover/notes:text-gray-500" />
                  </div>
                )}
              </td>
              <td className="py-3">
                {confirmDelete === app.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(app.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
