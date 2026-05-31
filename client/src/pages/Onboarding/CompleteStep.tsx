import { CheckCircle, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import type { ProfileData } from '../../types';

interface Props {
  profileData: ProfileData;
  onComplete: () => void;
}

export default function CompleteStep({ profileData, onComplete }: Props) {
  const { updateUser, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/profile', {
        profileData: { ...profileData, onboardingComplete: true },
      });
      updateUser(data);
      onComplete();
    } catch {
      // Still proceed even if the save fails
      if (user) updateUser({ ...user, profileData: { ...profileData, onboardingComplete: true } });
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">You're all set!</h2>
      <p className="text-sm text-gray-500 mb-6">Here's a summary of your profile.</p>

      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
        {profileData.currentRole && (
          <div className="flex items-center gap-3 text-sm">
            <Briefcase size={16} className="text-gray-400 shrink-0" />
            <div>
              <span className="text-gray-500">Role: </span>
              <span className="font-medium text-gray-800">{profileData.currentRole}</span>
              {profileData.yearsOfExperience !== undefined && (
                <span className="text-gray-500"> · {profileData.yearsOfExperience} yrs exp</span>
              )}
            </div>
          </div>
        )}
        {profileData.preferredLocations && profileData.preferredLocations.length > 0 && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-500">Locations: </span>
              <span className="font-medium text-gray-800">{profileData.preferredLocations.join(', ')}</span>
            </div>
          </div>
        )}
        {profileData.preferredJobTypes && profileData.preferredJobTypes.length > 0 && (
          <div className="flex items-start gap-3 text-sm">
            <Briefcase size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-500">Job Types: </span>
              <span className="font-medium text-gray-800">{profileData.preferredJobTypes.join(', ')}</span>
            </div>
          </div>
        )}
        {(profileData.expectedSalaryMin || profileData.expectedSalaryMax) && (
          <div className="flex items-center gap-3 text-sm">
            <DollarSign size={16} className="text-gray-400 shrink-0" />
            <div>
              <span className="text-gray-500">Expected Salary: </span>
              <span className="font-medium text-gray-800">
                ₹{profileData.expectedSalaryMin ?? '?'} – ₹{profileData.expectedSalaryMax ?? '?'} LPA
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-5">You can update these anytime in Settings.</p>

      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Loading…' : 'Go to Dashboard →'}
      </button>
    </div>
  );
}
