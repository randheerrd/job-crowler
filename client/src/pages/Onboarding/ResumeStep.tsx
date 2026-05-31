import { useState, useRef } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';
import api from '../../lib/axios';
import type { ProfileData, Resume } from '../../types';

interface Props {
  onNext: () => void;
  profileData: ProfileData;
}

export default function ResumeStep({ onNext }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', f);
      const { data } = await api.post<Resume>('/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(data);
      setSkills(data.extractedSkills);
    } catch {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeSkill = (s: string) => setSkills(prev => prev.filter(sk => sk !== s));

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setNewSkill('');
  };

  const handleSaveSkills = async () => {
    if (!resume) { onNext(); return; }
    setSaving(true);
    try {
      await api.put(`/resume/${resume.id}/skills`, { skills });
      onNext();
    } catch {
      setError('Failed to save skills.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Upload your resume</h2>
      <p className="text-sm text-gray-500 mb-6">We'll extract your skills automatically. You can edit them below.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFile(dropped);
          }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
        >
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="font-medium text-gray-700">Drop your resume here or <span className="text-primary-600">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">PDF or DOCX, max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          {uploading && (
            <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          )}
          {!uploading && (
            <button onClick={() => { setFile(null); setResume(null); setSkills([]); }} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extracted Skills ({skills.length}) — click × to remove
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-primary-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a skill…"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleSaveSkills}
          disabled={uploading || saving}
          className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors text-sm"
        >
          {saving ? 'Saving…' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
