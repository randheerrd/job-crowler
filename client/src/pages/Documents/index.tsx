import { useState, useEffect, useRef } from 'react';
import {
  FileText, Mail, Linkedin, Upload, Trash2, Plus, Save,
  CheckCircle2, CloudUpload, PenLine, X,
} from 'lucide-react';
import api from '../../lib/axios';
import { cn, formatDate } from '../../lib/utils';
import type { Resume } from '../../types';

type Tab = 'resume' | 'coverletter' | 'linkedin';

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface LinkedInData {
  headline: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  profileUrl: string;
}

const EMPTY_LI: LinkedInData = { headline: '', summary: '', skills: '', experience: '', education: '', profileUrl: '' };

const SKILL_COLORS = [
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
];

function skillColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return SKILL_COLORS[h % SKILL_COLORS.length];
}

export default function Documents() {
  const [tab, setTab] = useState<Tab>('resume');

  // Resume
  const [resume, setResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cover letters
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [selected, setSelected] = useState<CoverLetter | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [ltitle, setLtitle] = useState('');
  const [lcontent, setLcontent] = useState('');
  const [saving, setSaving] = useState(false);

  // LinkedIn
  const [li, setLi] = useState<LinkedInData>(EMPTY_LI);
  const [liSaving, setLiSaving] = useState(false);
  const [liSaved, setLiSaved] = useState(false);

  useEffect(() => {
    api.get('/resumes').then(r => setResume(r.data)).catch(() => {});
    api.get('/profile/cover-letters').then(r => setLetters(r.data)).catch(() => {});
    api.get('/profile').then(r => {
      if (r.data.profileData?.linkedinData) setLi({ ...EMPTY_LI, ...r.data.profileData.linkedinData });
    }).catch(() => {});
  }, []);

  async function handleFile(file: File) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) { setResumeError('Only PDF, DOC, DOCX files allowed.'); return; }
    setResumeError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const r = await api.post('/resumes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResume(r.data);
    } catch { setResumeError('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  }

  function startNew() { setIsNew(true); setSelected(null); setLtitle(''); setLcontent(''); }
  function startEdit(l: CoverLetter) { setIsNew(false); setSelected(l); setLtitle(l.title); setLcontent(l.content); }
  function cancelEdit() { setIsNew(false); setSelected(null); setLtitle(''); setLcontent(''); }

  async function saveLetter() {
    if (!ltitle.trim() || !lcontent.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const r = await api.post('/profile/cover-letters', { title: ltitle, content: lcontent });
        setLetters(p => [r.data, ...p]);
      } else if (selected) {
        const r = await api.put(`/profile/cover-letters/${selected.id}`, { title: ltitle, content: lcontent });
        setLetters(p => p.map(l => l.id === selected.id ? r.data : l));
      }
      cancelEdit();
    } finally { setSaving(false); }
  }

  async function deleteLetter(id: string) {
    await api.delete(`/profile/cover-letters/${id}`);
    setLetters(p => p.filter(l => l.id !== id));
    if (selected?.id === id) cancelEdit();
  }

  async function saveLi() {
    setLiSaving(true);
    try {
      await api.put('/profile/linkedin', { linkedinData: li });
      setLiSaved(true);
      setTimeout(() => setLiSaved(false), 2500);
    } finally { setLiSaving(false); }
  }

  const tabs = [
    { key: 'resume' as Tab, label: 'Resume', icon: FileText },
    { key: 'coverletter' as Tab, label: 'Cover Letters', icon: Mail },
    { key: 'linkedin' as Tab, label: 'LinkedIn', icon: Linkedin },
  ];

  const editorOpen = isNew || !!selected;
  const wordCount = lcontent.trim() ? lcontent.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Resume, cover letters, and professional profile — all in one place.</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── RESUME TAB ── */}
      {tab === 'resume' && (
        <div className="space-y-5">
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={cn(
              'relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all select-none',
              dragOver
                ? 'border-primary-500 bg-primary-500/5'
                : 'border-gray-200 hover:border-primary-500/40 hover:bg-gray-100/50'
            )}
          >
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
              dragOver ? 'bg-primary-500/20' : 'bg-gray-200'
            )}>
              <CloudUpload size={28} className={dragOver ? 'text-primary-400' : 'text-gray-500'} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-base">
                {uploading ? 'Uploading your resume…' : dragOver ? 'Drop it here!' : 'Drop your resume or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX up to 5 MB</p>
            </div>
            {resume && (
              <span className="text-xs text-gray-400">Uploading will replace your current resume</span>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {resumeError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <X size={14} /> {resumeError}
            </p>
          )}

          {/* Current resume card */}
          {resume && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base leading-tight">
                      {resume.filePath.split('/').pop() || 'resume'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Uploaded {formatDate(resume.createdAt)}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-full shrink-0">
                  <CheckCircle2 size={12} />
                  Active
                </span>
              </div>

              {resume.extractedSkills.length > 0 && (
                <div className="px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                    {resume.extractedSkills.length} Skills Extracted
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resume.extractedSkills.map(skill => (
                      <span
                        key={skill}
                        className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', skillColor(skill))}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.extractedSkills.length === 0 && (
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-500">No skills were automatically detected. Consider using a cleaner, text-based PDF for better extraction.</p>
                </div>
              )}
            </div>
          )}

          {!resume && !uploading && (
            <div className="text-center py-4 text-sm text-gray-500">
              No resume uploaded yet.
            </div>
          )}
        </div>
      )}

      {/* ── COVER LETTERS TAB ── */}
      {tab === 'coverletter' && (
        <div className={cn(
          'gap-5',
          editorOpen ? 'grid grid-cols-1 lg:grid-cols-5' : 'block'
        )}>
          {/* Left: list */}
          <div className={cn(editorOpen ? 'lg:col-span-2' : 'max-w-2xl', 'space-y-3')}>
            <button
              onClick={startNew}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary-500/50 hover:text-primary-400 hover:bg-primary-500/5 transition-all"
            >
              <Plus size={16} />
              New Cover Letter
            </button>

            {letters.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                <Mail size={32} className="mx-auto mb-3 opacity-30" />
                <p>No cover letters yet.</p>
                <p className="mt-1 text-xs">Create one for each job type or company.</p>
              </div>
            ) : (
              letters.map(letter => (
                <div
                  key={letter.id}
                  onClick={() => startEdit(letter)}
                  className={cn(
                    'bg-white rounded-xl border px-4 py-4 cursor-pointer transition-all group',
                    selected?.id === letter.id
                      ? 'border-primary-500/50 ring-1 ring-primary-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{letter.title}</p>
                    <button
                      onClick={e => { e.stopPropagation(); deleteLetter(letter.id); }}
                      className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{letter.content}</p>
                  <p className="text-[11px] text-gray-400 mt-2">Updated {formatDate(letter.updatedAt)}</p>
                </div>
              ))
            )}
          </div>

          {/* Right: editor */}
          {editorOpen && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <PenLine size={13} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {isNew ? 'New Cover Letter' : 'Edit Cover Letter'}
                    </span>
                  </div>
                  <button onClick={cancelEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <X size={15} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer @ Google"
                      value={ltitle}
                      onChange={e => setLtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Content</label>
                    <textarea
                      placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in..."
                      value={lcontent}
                      onChange={e => setLcontent(e.target.value)}
                      rows={16}
                      className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none leading-relaxed transition-colors font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{wordCount} words</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-100">
                  <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-200">
                    Discard
                  </button>
                  <button
                    onClick={saveLetter}
                    disabled={saving || !ltitle.trim() || !lcontent.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-40 transition-colors"
                  >
                    <Save size={14} />
                    {saving ? 'Saving…' : 'Save Letter'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LINKEDIN TAB ── */}
      {tab === 'linkedin' && (
        <div className="max-w-3xl space-y-5">
          {/* Info banner */}
          <div className="flex gap-4 bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
            <Linkedin size={20} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-gray-800 mb-0.5">How to import your LinkedIn profile</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Open your LinkedIn profile, copy each section (About, Experience, Skills) and paste below.
                This data is saved privately and used to auto-fill your job applications.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
            {/* Basic info */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Basic Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Profile URL</label>
                  <input
                    type="url"
                    placeholder="linkedin.com/in/your-name"
                    value={li.profileUrl}
                    onChange={e => setLi(p => ({ ...p, profileUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Headline</label>
                  <input
                    type="text"
                    placeholder="Full Stack Developer at Acme"
                    value={li.headline}
                    onChange={e => setLi(p => ({ ...p, headline: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">About</p>
              <textarea
                placeholder="Paste your LinkedIn About section here…"
                value={li.summary}
                onChange={e => setLi(p => ({ ...p, summary: e.target.value }))}
                rows={4}
                className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Skills */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</p>
              <input
                type="text"
                placeholder="React, TypeScript, Node.js, AWS, Docker…"
                value={li.skills}
                onChange={e => setLi(p => ({ ...p, skills: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
              {li.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {li.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', skillColor(s))}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</p>
              <textarea
                placeholder="e.g. Software Engineer @ Google, 2022–present — Led development of…"
                value={li.experience}
                onChange={e => setLi(p => ({ ...p, experience: e.target.value }))}
                rows={5}
                className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Education */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</p>
              <textarea
                placeholder="e.g. B.Tech Computer Science, IIT Delhi, 2018–2022"
                value={li.education}
                onChange={e => setLi(p => ({ ...p, education: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Save footer */}
            <div className="px-6 py-4 bg-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Stored privately in your account</p>
              <button
                onClick={saveLi}
                disabled={liSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {liSaved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                {liSaving ? 'Saving…' : liSaved ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
