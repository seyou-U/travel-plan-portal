import { NavLink } from 'react-router-dom';
import { BrandHeader } from './BrandHeader';

const NAV_ITEMS = [
  { to: '/top', label: 'ホーム', icon: '⌂' },
  { to: '/plans/new/ai', label: 'AIアシスタント', icon: '✦' },
  { to: '/plans/new/manual', label: '手動で作成', icon: '＋' },
  { to: '/plan', label: 'マイプラン', icon: '▤' },
  { to: '/settings', label: '設定', icon: '⚙' },
];

export function AppSideBar({ user, onLogout, isLoggingOut = false }) {
  return (
    <aside className="flex border-b border-teal-900/20 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 px-4 py-3 text-white lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
      <div className="flex shrink-0 items-center gap-2 lg:border-b lg:border-white/10 lg:pb-4">
        <BrandHeader />
      </div>

      <div className="ml-auto hidden min-w-0 rounded-xl bg-white/10 p-3 sm:block lg:ml-0 lg:mt-4">
        <p className="text-sm font-bold">{user?.name ?? 'ゲストユーザー'}</p>
        <p className="mt-0.5 max-w-44 truncate text-[11px] text-white/70">
          {user?.email ?? 'guest@example.com'}
        </p>
      </div>

      <nav
        aria-label="メインナビゲーション"
        className="ml-3 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:ml-0 lg:mt-5 lg:block lg:flex-none lg:space-y-1 lg:overflow-visible"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:text-sm ${
                isActive
                  ? 'bg-white/18 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span aria-hidden="true" className="w-4 text-center">
              {item.icon}
            </span>
            <span className="hidden md:inline lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        aria-label="ログアウト"
        className="ml-2 shrink-0 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 lg:ml-0 lg:mt-auto lg:text-left lg:text-sm"
      >
        <span className="lg:hidden">↪</span>
        <span className="hidden lg:inline">{isLoggingOut ? 'ログアウト中...' : 'ログアウト'}</span>
      </button>
    </aside>
  );
}
