import { Outlet } from 'react-router-dom';
import { TopFooter } from '../components/home/TopFooter';
import { TopHeader } from '../components/home/TopHeader';

export default function PublicHomeLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopHeader />
      <main>
        <Outlet />
      </main>
      <TopFooter />
    </div>
  );
}
