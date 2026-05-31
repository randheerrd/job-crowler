import { NavLink, Link } from 'react-router-dom';
import { Search, ClipboardList, FileText, Settings, LogOut, Puzzle, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import CalosLogo from './CalosLogo';

const NAV = [
  { to: '/', icon: Search, label: 'Discover', end: true },
  { to: '/tracker', icon: ClipboardList, label: 'Applications' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/sources', icon: Globe, label: 'Sources' },
  { to: '/extension', icon: Puzzle, label: 'Extension' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <aside className="w-52 shrink-0 hidden md:flex flex-col bg-gray-100 border-r border-gray-300">
      {/* Brand */}
      <div className="h-11 flex items-center px-3.5 border-b border-gray-300 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <CalosLogo size={18} className="shrink-0 text-primary-500" />
          <span className="text-sm font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Calos</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-1.5 pt-2">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 h-8 px-2.5 rounded text-xs font-medium transition-colors mb-0.5',
              isActive
                ? 'bg-gray-300 text-gray-900'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={14} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-1.5 border-t border-gray-300 shrink-0">
        <div className="flex items-center gap-2 h-8 px-2.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-700 shrink-0">
            {initials}
          </div>
          <p className="text-xs text-gray-700 truncate flex-1 font-medium">{user?.name}</p>
        </div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-2.5 h-8 w-full px-2.5 rounded text-xs text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
