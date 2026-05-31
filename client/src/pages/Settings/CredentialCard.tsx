import { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PORTAL_COLORS } from '../../lib/utils';
import api from '../../lib/axios';
import type { Credential } from '../../types';

interface Props {
  credential: Credential;
  onDeleted: (id: string) => void;
  onUpdated: (c: Credential) => void;
}

const STATUS_CONFIG = {
  connected: { icon: CheckCircle, label: 'Connected', color: 'text-green-600 bg-green-50' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600 bg-red-50' },
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
};

export default function CredentialCard({ credential, onDeleted, onUpdated }: Props) {
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCfg = STATUS_CONFIG[credential.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data } = await api.post(`/credentials/${credential.id}/test`);
      onUpdated({ ...credential, status: data.status });
    } catch {
      onUpdated({ ...credential, status: 'failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await api.delete(`/credentials/${credential.id}`);
      onDeleted(credential.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${PORTAL_COLORS[credential.portal] || 'bg-gray-100 text-gray-700'}`}>
        {credential.portal}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{credential.username}</p>
        <p className="text-xs text-gray-400 mt-0.5">Added {new Date(credential.createdAt).toLocaleDateString()}</p>
      </div>

      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
        <StatusIcon size={12} />
        {statusCfg.label}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
          {testing ? 'Testing…' : 'Test'}
        </button>

        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? '…' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
