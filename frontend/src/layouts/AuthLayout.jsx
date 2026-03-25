import { Outlet } from 'react-router-dom';

// ログインおよび新規登録画面などの認証関連画面のレイアウト
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
