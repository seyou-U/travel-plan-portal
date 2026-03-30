import { NavLink } from 'react-router-dom';
import { BrandIcon } from './icons';
import { BrandHeader } from './BrandHeader';

const NAV_ITEMS = [
  { to: '/top', label: 'ホーム' },
  { to: '/plan', label: 'マイプラン' },
  { to: '/settings', label: '設定' },
];

function NavDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}

export function AppSideBar({ user, onLogout, isLoggingOut = false }) {
  return (
    <aside className="flex h-full min-h-[200px] flex-col border-r border-teal-900/20 bg-gradient-to-b from-teal-800 to-teal-700 px-4 py-5 text-white">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <BrandHeader />
      </div>

      <div className="mt-4 rounded-xl bg-white/10 p-3">
        <p className="text-sm font-bold">{user?.name ?? 'ゲストユーザー'}</p>
        <p className="mt-0.5 text-[11px] text-white/70">{user?.email ?? 'guest@example.com'}</p>
      </div>

      <nav className="mt-5 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white/18 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <NavDot />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-auto rounded-md border border-white/20 px-3 py-2 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
      </button>
    </aside>
  );
}
