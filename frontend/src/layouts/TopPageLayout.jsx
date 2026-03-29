import { Outlet } from 'react-router-dom';
import { TopFooter } from '../components/home/TopFooter';
import { TopHeader } from '../components/home/TopHeader';

// ログイン後のTOP画面のレイアウト
export default function TopPageLayout() {
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
