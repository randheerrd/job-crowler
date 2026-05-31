import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/tracker', icon: ClipboardList, label: 'Tracker', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 shrink-0 hidden md:block">
      <nav className="p-3 space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
