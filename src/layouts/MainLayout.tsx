import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import FloatingActionButton from '../components/FloatingActionButton';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
