import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, FileText, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Discover', end: true },
  { to: '/documents', icon: FileText, label: 'Documents', end: false },
  { to: '/tracker', icon: ClipboardList, label: 'Applications', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col bg-gray-100 border-r border-gray-300">
      {/* Brand */}
      <div className="px-4 h-14 flex items-center border-b border-gray-300 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[10px]">JC</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">JobCrawler</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-2 flex-1 space-y-0.5 pt-3">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-primary-600/15 text-primary-400'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-gray-300 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded mb-0.5">
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center font-semibold text-[10px] text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded text-sm text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
