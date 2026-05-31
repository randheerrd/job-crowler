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
  LinkedIn:    'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  Naukri:      'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  Indeed:      'bg-violet-500/10 text-violet-400 border border-violet-500/15',
  Internshala: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  Wellfound:   'bg-rose-500/10 text-rose-400 border border-rose-500/15',
  Remotive:    'bg-teal-500/10 text-teal-400 border border-teal-500/15',
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
export const PORTALS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Wellfound'];
export const APPLICATION_STATUSES = [
  'Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn',
];
