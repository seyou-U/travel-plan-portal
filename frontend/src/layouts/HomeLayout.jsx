import { Outlet } from "react-router-dom";

// ログイン後の共有画面のレイアウト
export default function HomeLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
