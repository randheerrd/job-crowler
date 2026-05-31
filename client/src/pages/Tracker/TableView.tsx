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

function getTitle(app: Application) { return app.job?.title || app.manualJob?.title || 'Unknown Position'; }
function getCompany(app: Application) { return app.job?.company || app.manualJob?.company || '—'; }
function getUrl(app: Application) { return app.job?.url || app.manualJob?.url || null; }
function getPortal(app: Application) { return app.job?.portal || 'Manual'; }

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
      onUpdated(data); setEditingNotes(null);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      await api.delete(`/applications/${id}`);
      onDeleted(id); setConfirmDelete(null);
    } catch { /* ignore */ }
  };

  if (applications.length === 0) {
    return <div className="text-center py-10 text-gray-600 text-xs">No applications found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Company</th>
            <th className="hidden md:table-cell">Source</th>
            <th className="hidden sm:table-cell">Applied</th>
            <th>Status</th>
            <th className="hidden lg:table-cell">Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id} className="group">
              <td className="min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900">{getTitle(app)}</span>
                  {getUrl(app) && (
                    <a
                      href={getUrl(app)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary-400 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </td>

              <td className="w-36 text-gray-700 text-xs">{getCompany(app)}</td>

              <td className="w-24 hidden md:table-cell">
                <span className="text-[11px] text-gray-600 bg-gray-300/40 px-1.5 py-0.5 rounded">
                  {getPortal(app)}
                </span>
              </td>

              <td className="w-24 text-gray-600 text-xs hidden sm:table-cell">
                {formatDate(app.dateApplied)}
              </td>

              <td className="w-40">
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                  className={cn(
                    'text-[11px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer',
                    STATUS_COLORS[app.status] || 'bg-gray-300/30 text-gray-700'
                  )}
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  {APPLICATION_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>

              <td className="max-w-[180px] hidden lg:table-cell">
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
                      className="flex-1 px-2 py-1 text-xs"
                      autoFocus
                    />
                    <button onClick={() => handleSaveNotes(app)} className="text-emerald-400 hover:text-emerald-300">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingNotes(null)} className="text-gray-500 hover:text-gray-700">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 cursor-pointer group/notes"
                    onClick={() => { setEditingNotes(app.id); setNotesDraft(app.notes || ''); }}
                  >
                    <span className={cn('text-xs truncate', app.notes ? 'text-gray-700' : 'text-gray-500 italic')}>
                      {app.notes || 'Add notes…'}
                    </span>
                    <Edit2 size={10} className="shrink-0 text-gray-500 opacity-0 group-hover/notes:opacity-100" />
                  </div>
                )}
              </td>

              <td className="w-24 pr-3">
                {confirmDelete === app.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-[11px] px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[11px] px-2 py-0.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 size={13} />
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
