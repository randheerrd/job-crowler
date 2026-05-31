import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
