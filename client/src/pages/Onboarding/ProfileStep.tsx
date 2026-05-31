import { useState } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import type { ProfileData } from '../../types';
import { JOB_TYPES } from '../../lib/utils';

const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote'];

interface Props {
  onNext: (data: ProfileData) => void;
}

export default function ProfileStep({ onNext }: Props) {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    currentRole: '',
    yearsOfExperience: '',
    preferredJobTypes: [] as string[],
    preferredLocations: [] as string[],
    expectedSalaryMin: '',
    expectedSalaryMax: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleItem = (field: 'preferredJobTypes' | 'preferredLocations', value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profileData: ProfileData = {
        currentRole: form.currentRole,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        preferredJobTypes: form.preferredJobTypes,
        preferredLocations: form.preferredLocations,
        expectedSalaryMin: form.expectedSalaryMin ? parseInt(form.expectedSalaryMin) : undefined,
        expectedSalaryMax: form.expectedSalaryMax ? parseInt(form.expectedSalaryMax) : undefined,
      };

      const { data } = await api.put('/profile', { name: form.name, profileData });
      updateUser(data);
      onNext(profileData);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
      <p className="text-sm text-gray-500 mb-6">This helps us surface the most relevant job listings.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Role / Title</label>
            <input
              type="text"
              value={form.currentRole}
              onChange={e => setForm(f => ({ ...f, currentRole: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. Frontend Developer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="40"
              value={form.yearsOfExperience}
              onChange={e => setForm(f => ({ ...f, yearsOfExperience: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleItem('preferredJobTypes', type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.preferredJobTypes.includes(type)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => toggleItem('preferredLocations', loc)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.preferredLocations.includes(loc)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary Range (LPA)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              value={form.expectedSalaryMin}
              onChange={e => setForm(f => ({ ...f, expectedSalaryMin: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Min (e.g. 10)"
            />
            <input
              type="number"
              min="0"
              value={form.expectedSalaryMax}
              onChange={e => setForm(f => ({ ...f, expectedSalaryMax: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Max (e.g. 25)"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors text-sm"
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </form>
    </div>
  );
}
