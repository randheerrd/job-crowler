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

// Dark-theme opacity badge styles (for Render dark bg)
export const PORTAL_COLORS: Record<string, string> = {
  LinkedIn:    'bg-blue-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/25',
  Naukri:      'bg-orange-500/15 text-orange-400 ring-1 ring-inset ring-orange-500/25',
  Indeed:      'bg-violet-500/15 text-violet-400 ring-1 ring-inset ring-violet-500/25',
  Internshala: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  Wellfound:   'bg-rose-500/15 text-rose-400 ring-1 ring-inset ring-rose-500/25',
  Remotive:    'bg-teal-500/15 text-teal-400 ring-1 ring-inset ring-teal-500/25',
};

export const STATUS_COLORS: Record<string, string> = {
  Saved:                'bg-gray-400/10 text-gray-600 ring-1 ring-inset ring-gray-400/20',
  Applied:              'bg-blue-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/25',
  'Interview Scheduled':'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
  'Offer Received':     'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  Rejected:             'bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/25',
  Withdrawn:            'bg-gray-400/10 text-gray-500 ring-1 ring-inset ring-gray-400/20',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'];
export const PORTALS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Wellfound'];
export const APPLICATION_STATUSES = [
  'Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn',
];
