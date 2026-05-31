import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import ProfileStep from './ProfileStep';
import ResumeStep from './ResumeStep';
import CompleteStep from './CompleteStep';
import type { ProfileData } from '../../types';

const STEPS = ['Profile', 'Resume', 'Done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({});

  const handleProfileDone = (data: ProfileData) => {
    setProfileData(data);
    setStep(1);
  };

  const handleResumeDone = () => {
    setStep(2);
  };

  const handleComplete = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
          <Briefcase size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl text-gray-900">JobCrawler</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
              i < step ? 'bg-primary-600 text-white' :
              i === step ? 'bg-primary-600 text-white ring-4 ring-primary-200' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {step === 0 && <ProfileStep onNext={handleProfileDone} />}
        {step === 1 && <ResumeStep onNext={handleResumeDone} profileData={profileData} />}
        {step === 2 && <CompleteStep profileData={profileData} onComplete={handleComplete} />}
      </div>
    </div>
  );
}
