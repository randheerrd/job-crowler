import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, FileText, LogOut, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Discover Jobs', end: true },
  { to: '/documents', icon: FileText, label: 'My Documents', end: false },
  { to: '/tracker', icon: ClipboardList, label: 'Applications', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-primary-950">
      {/* Brand */}
      <div className="px-5 h-16 flex items-center border-b border-white/10 shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">JobCrawler</p>
            <p className="text-primary-400 text-[10px] leading-tight">Find your next role</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-4 flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 px-3 pb-2">
          Navigation
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
                  ? 'bg-white/10 text-white'
                  : 'text-primary-300 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10 shrink-0 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs text-white shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-primary-400 truncate leading-tight mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
