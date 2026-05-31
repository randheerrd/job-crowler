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
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatSalary(salary: string | null): string {
  return salary || 'Not disclosed';
}

export const PORTAL_COLORS: Record<string, string> = {
  LinkedIn:    'bg-blue-100 text-blue-700',
  Naukri:      'bg-orange-100 text-orange-700',
  Indeed:      'bg-violet-100 text-violet-700',
  Internshala: 'bg-emerald-100 text-emerald-700',
  Wellfound:   'bg-rose-100 text-rose-700',
  Remotive:    'bg-teal-100 text-teal-700',
};

export const STATUS_COLORS: Record<string, string> = {
  Saved:                'bg-slate-100 text-slate-600',
  Applied:              'bg-blue-100 text-blue-700',
  'Interview Scheduled':'bg-amber-100 text-amber-700',
  'Offer Received':     'bg-emerald-100 text-emerald-700',
  Rejected:             'bg-red-100 text-red-600',
  Withdrawn:            'bg-gray-100 text-gray-500',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'];
export const PORTALS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Wellfound'];
export const APPLICATION_STATUSES = [
  'Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn',
];
