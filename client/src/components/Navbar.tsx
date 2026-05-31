import { Link } from 'react-router-dom';
import { Briefcase, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 z-10 shrink-0">
      <Link to="/" className="flex items-center gap-2 font-bold text-primary-600 text-lg">
        <Briefcase size={22} />
        <span>JobCrawler</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium text-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block font-medium">{user?.name}</span>
        </div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
