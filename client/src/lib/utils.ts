import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatSalary(salary: string | null): string {
  return salary || 'Not disclosed';
}

// Attio-style: muted opacity badges for dark warm backgrounds
export const PORTAL_COLORS: Record<string, string> = {
  LinkedIn:         'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  Indeed:           'bg-violet-500/10 text-violet-400 border border-violet-500/15',
  Glassdoor:        'bg-green-500/10 text-green-400 border border-green-500/15',
  Monster:          'bg-purple-500/10 text-purple-400 border border-purple-500/15',
  ZipRecruiter:     'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  CareerBuilder:    'bg-sky-500/10 text-sky-400 border border-sky-500/15',
  SimplyHired:      'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  Dice:             'bg-red-500/10 text-red-400 border border-red-500/15',
  Hired:            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15',
  Wellfound:        'bg-rose-500/10 text-rose-400 border border-rose-500/15',
  Remotive:         'bg-teal-500/10 text-teal-400 border border-teal-500/15',
  'We Work Remotely':'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15',
  Otta:             'bg-lime-500/10 text-lime-400 border border-lime-500/15',
  Cutshort:         'bg-amber-500/10 text-amber-400 border border-amber-500/15',
  'HackerEarth Jobs':'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  Himalayas:        'bg-sky-500/10 text-sky-400 border border-sky-500/15',
  Naukri:           'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  Internshala:      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  Shine:            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  TimesJobs:        'bg-red-500/10 text-red-400 border border-red-500/15',
  Apna:             'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  WorkIndia:        'bg-purple-500/10 text-purple-400 border border-purple-500/15',
  iimjobs:          'bg-rose-500/10 text-rose-400 border border-rose-500/15',
  Instahyre:        'bg-violet-500/10 text-violet-400 border border-violet-500/15',
  Stepstone:        'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  XING:             'bg-green-500/10 text-green-400 border border-green-500/15',
  Totaljobs:        'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  Reed:             'bg-red-500/10 text-red-400 border border-red-500/15',
  'CV-Library':     'bg-teal-500/10 text-teal-400 border border-teal-500/15',
  JobStreet:        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15',
  Seek:             'bg-sky-500/10 text-sky-400 border border-sky-500/15',
  JobsDB:           'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  Bayt:             'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  GulfTalent:       'bg-amber-500/10 text-amber-400 border border-amber-500/15',
  Naukrigulf:       'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  'Remote.co':      'bg-teal-500/10 text-teal-400 border border-teal-500/15',
  FlexJobs:         'bg-green-500/10 text-green-400 border border-green-500/15',
};

export const STATUS_COLORS: Record<string, string> = {
  Saved:                'bg-gray-400/10 text-gray-600',
  Applied:              'bg-blue-500/10 text-blue-400',
  'Interview Scheduled':'bg-amber-500/10 text-amber-400',
  'Offer Received':     'bg-emerald-500/10 text-emerald-400',
  Rejected:             'bg-red-500/10 text-red-400',
  Withdrawn:            'bg-gray-400/10 text-gray-500',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'];

export type PortalMeta = {
  desc: string;
  category: string;
  accent: string;  // tailwind bg color for the logo square
  text: string;    // tailwind text color
};

export const PORTAL_META: Record<string, PortalMeta> = {
  // Global
  LinkedIn:          { desc: 'Professional networking & jobs',      category: 'Global',        accent: 'bg-blue-500/15',    text: 'text-blue-400' },
  Indeed:            { desc: 'World\'s largest job aggregator',     category: 'Global',        accent: 'bg-violet-500/15',  text: 'text-violet-400' },
  Glassdoor:         { desc: 'Jobs + company reviews & salaries',   category: 'Global',        accent: 'bg-green-500/15',   text: 'text-green-400' },
  Monster:           { desc: 'Established global job board',        category: 'Global',        accent: 'bg-purple-500/15',  text: 'text-purple-400' },
  ZipRecruiter:      { desc: 'AI-powered job matching',             category: 'Global',        accent: 'bg-blue-500/15',    text: 'text-blue-400' },
  CareerBuilder:     { desc: 'US-based career marketplace',         category: 'Global',        accent: 'bg-sky-500/15',     text: 'text-sky-400' },
  SimplyHired:       { desc: 'Simple job search aggregator',        category: 'Global',        accent: 'bg-orange-500/15',  text: 'text-orange-400' },
  Dice:              { desc: 'Tech & IT specialist jobs',           category: 'Global',        accent: 'bg-red-500/15',     text: 'text-red-400' },
  Hired:             { desc: 'Curated tech & engineering roles',    category: 'Global',        accent: 'bg-indigo-500/15',  text: 'text-indigo-400' },
  // Startup / Tech
  Wellfound:         { desc: 'Startup & VC-backed company jobs',    category: 'Startup/Tech',  accent: 'bg-rose-500/15',    text: 'text-rose-400' },
  Remotive:          { desc: 'Remote-first tech job listings',      category: 'Startup/Tech',  accent: 'bg-teal-500/15',    text: 'text-teal-400' },
  'We Work Remotely':{ desc: 'Top remote jobs in tech & design',    category: 'Startup/Tech',  accent: 'bg-cyan-500/15',    text: 'text-cyan-400' },
  Otta:              { desc: 'Curated startup jobs in London & US', category: 'Startup/Tech',  accent: 'bg-lime-500/15',    text: 'text-lime-400' },
  Cutshort:          { desc: 'AI-based tech hiring in India',       category: 'Startup/Tech',  accent: 'bg-amber-500/15',   text: 'text-amber-400' },
  'HackerEarth Jobs':{ desc: 'Developer jobs via coding profile',   category: 'Startup/Tech',  accent: 'bg-orange-500/15',  text: 'text-orange-400' },
  Himalayas:         { desc: 'Remote job board with salary data',   category: 'Startup/Tech',  accent: 'bg-sky-500/15',     text: 'text-sky-400' },
  // India
  Naukri:            { desc: 'India\'s largest job portal',         category: 'India',         accent: 'bg-orange-500/15',  text: 'text-orange-400' },
  Internshala:       { desc: 'Internships & fresher job listings',  category: 'India',         accent: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Shine:             { desc: 'Mid-senior level jobs in India',      category: 'India',         accent: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  TimesJobs:         { desc: 'Jobs from Times of India Group',      category: 'India',         accent: 'bg-red-500/15',     text: 'text-red-400' },
  Apna:              { desc: 'Blue-collar & blue-white collar jobs', category: 'India',         accent: 'bg-blue-500/15',    text: 'text-blue-400' },
  WorkIndia:         { desc: 'Entry-level & blue-collar workforce', category: 'India',         accent: 'bg-purple-500/15',  text: 'text-purple-400' },
  iimjobs:           { desc: 'MBA & management professional roles', category: 'India',         accent: 'bg-rose-500/15',    text: 'text-rose-400' },
  Instahyre:         { desc: 'Fast hiring for tech startups',       category: 'India',         accent: 'bg-violet-500/15',  text: 'text-violet-400' },
  // Europe
  Stepstone:         { desc: 'Europe\'s leading job marketplace',   category: 'Europe',        accent: 'bg-orange-500/15',  text: 'text-orange-400' },
  XING:              { desc: 'German professional networking',       category: 'Europe',        accent: 'bg-green-500/15',   text: 'text-green-400' },
  Totaljobs:         { desc: 'UK\'s largest job site',              category: 'Europe',        accent: 'bg-blue-500/15',    text: 'text-blue-400' },
  Reed:              { desc: 'UK jobs across all industries',       category: 'Europe',        accent: 'bg-red-500/15',     text: 'text-red-400' },
  'CV-Library':      { desc: 'UK CV-based job matching',            category: 'Europe',        accent: 'bg-teal-500/15',    text: 'text-teal-400' },
  // Asia Pacific
  JobStreet:         { desc: 'Jobs across SE Asia',                 category: 'Asia Pacific',  accent: 'bg-indigo-500/15',  text: 'text-indigo-400' },
  Seek:              { desc: 'Australia & NZ job search',           category: 'Asia Pacific',  accent: 'bg-sky-500/15',     text: 'text-sky-400' },
  JobsDB:            { desc: 'Careers in Hong Kong & SE Asia',      category: 'Asia Pacific',  accent: 'bg-blue-500/15',    text: 'text-blue-400' },
  // Middle East
  Bayt:              { desc: 'Middle East\'s leading job site',     category: 'Middle East',   accent: 'bg-emerald-500/15', text: 'text-emerald-400' },
  GulfTalent:        { desc: 'Professional roles in GCC countries', category: 'Middle East',   accent: 'bg-amber-500/15',   text: 'text-amber-400' },
  Naukrigulf:        { desc: 'Indian professionals in Gulf region', category: 'Middle East',   accent: 'bg-orange-500/15',  text: 'text-orange-400' },
  // Remote-first
  'Remote.co':       { desc: 'Vetted remote job listings',          category: 'Remote',        accent: 'bg-teal-500/15',    text: 'text-teal-400' },
  FlexJobs:          { desc: 'Flexible & remote job opportunities', category: 'Remote',        accent: 'bg-green-500/15',   text: 'text-green-400' },
};

export const PORTAL_CATEGORIES = ['Global', 'Startup/Tech', 'India', 'Europe', 'Asia Pacific', 'Middle East', 'Remote'];

export const PORTALS = Object.keys(PORTAL_META);
export const APPLICATION_STATUSES = [
  'Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn',
];
