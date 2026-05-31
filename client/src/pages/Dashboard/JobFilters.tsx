import { X } from 'lucide-react';
import type { JobFilters } from '../../types';
import { PORTALS, JOB_TYPES } from '../../lib/utils';

interface Props {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  onReset: () => void;
}

const DATE_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];

export default function JobFilters({ filters, onChange, onReset }: Props) {
  const hasFilters = !!(filters.portal || filters.location || filters.jobType || filters.datePosted);

  return (
    <aside className="w-56 shrink-0 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Portal */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Source Portal</label>
        <div className="space-y-1.5">
          {PORTALS.map(portal => (
            <label key={portal} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="portal"
                value={portal}
                checked={filters.portal === portal}
                onChange={() => onChange({ ...filters, portal: filters.portal === portal ? '' : portal, page: 1 })}
                className="w-3.5 h-3.5 accent-primary-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{portal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Job Type</label>
        <div className="space-y-1.5">
          {JOB_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={() => onChange({ ...filters, jobType: filters.jobType === type ? '' : type, page: 1 })}
                className="w-3.5 h-3.5 accent-primary-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Location</label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={e => onChange({ ...filters, location: e.target.value, page: 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Bangalore"
        />
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Date Posted</label>
        <div className="space-y-1.5">
          {DATE_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="datePosted"
                value={opt.value}
                checked={(filters.datePosted || '') === opt.value}
                onChange={() => onChange({ ...filters, datePosted: opt.value as JobFilters['datePosted'], page: 1 })}
                className="w-3.5 h-3.5 accent-primary-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
