import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, KeyRound } from 'lucide-react';
import api from '../../lib/axios';
import type { Credential } from '../../types';
import CredentialCard from './CredentialCard';
import AddCredentialModal from './AddCredentialModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function Settings() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: credentials = [], isLoading } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: () => api.get('/credentials').then(r => r.data),
  });

  const handleAdded = (c: Credential) => {
    qc.setQueryData<Credential[]>(['credentials'], prev => [...(prev || []), c]);
  };

  const handleDeleted = (id: string) => {
    qc.setQueryData<Credential[]>(['credentials'], prev => prev?.filter(c => c.id !== id) || []);
  };

  const handleUpdated = (updated: Credential) => {
    qc.setQueryData<Credential[]>(['credentials'], prev =>
      prev?.map(c => c.id === updated.id ? updated : c) || []
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your job portal credentials and account preferences.</p>
      </div>

      {/* Credential Manager */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <KeyRound size={18} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Portal Credentials</h2>
              <p className="text-xs text-gray-500">{credentials.length} / 5 portals connected</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={credentials.length >= 5}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            Add Portal
          </button>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : credentials.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No portals connected"
              description="Add credentials for LinkedIn, Naukri, Indeed, and more to start aggregating jobs."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  Add your first portal
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {credentials.map(c => (
                <CredentialCard
                  key={c.id}
                  credential={c}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Your credentials are encrypted</p>
          <p className="text-xs text-blue-700 mt-0.5">
            All passwords are encrypted using AES-256-GCM before being stored. We never store plain-text passwords.
          </p>
        </div>
      </div>

      {showModal && (
        <AddCredentialModal
          existingPortals={credentials.map(c => c.portal)}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
