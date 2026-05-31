import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 z-10 shrink-0">
      <Link to="/" className="flex items-center gap-2 font-bold text-primary-500 text-lg">
        <Briefcase size={22} />
        <span>JobCrawler</span>
      </Link>
    </header>
  );
}
