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
  LinkedIn:    'bg-amber-100 text-amber-800',
  Naukri:      'bg-orange-100 text-orange-800',
  Indeed:      'bg-yellow-100 text-yellow-800',
  Internshala: 'bg-lime-100 text-lime-800',
  Wellfound:   'bg-rose-100 text-rose-800',
};

export const STATUS_COLORS: Record<string, string> = {
  Saved:                'bg-stone-200 text-stone-700',
  Applied:              'bg-amber-100 text-amber-800',
  'Interview Scheduled':'bg-yellow-100 text-yellow-800',
  'Offer Received':     'bg-green-100 text-green-800',
  Rejected:             'bg-red-100 text-red-700',
  Withdrawn:            'bg-stone-100 text-stone-500',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Internship'];
export const PORTALS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Wellfound'];
export const APPLICATION_STATUSES = [
  'Saved', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Withdrawn',
];
