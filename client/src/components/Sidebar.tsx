import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, FileText, LogOut, Zap } from 'lucide-react';
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
    <aside className="w-60 shrink-0 hidden md:flex flex-col bg-gray-100 border-r border-gray-300">
      {/* Brand */}
      <div className="px-5 h-16 flex items-center border-b border-gray-300 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center shrink-0">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight tracking-tight">JobCrawler</p>
            <p className="text-gray-500 text-[10px] leading-tight">Find your next role</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 space-y-0.5 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-3 pb-2">
          Menu
        </p>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-600/15 text-primary-400 ring-1 ring-inset ring-primary-500/20'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-300 shrink-0 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center font-bold text-xs text-white shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
