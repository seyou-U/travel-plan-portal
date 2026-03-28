import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const NAV_ITEMS = [
  { to: '/top', label: 'ホーム' },
  { to: '/plan', label: 'マイプラン' },
  { to: '/settings', label: '設定' },
];

function TravelLogo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-teal-700">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M3.75 10.5a.75.75 0 0 1 .75-.75h7.28l-1.72-1.72a.75.75 0 1 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H4.5a.75.75 0 0 1-.75-.75Z" />
      </svg>
    </div>
  );
}

function NavDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}

export default function HomeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logout();
      navigate('/login', {
        replace: true,
        state: { logoutMessage: response?.message },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="flex h-full min-h-[200px] flex-col border-r border-teal-900/20 bg-gradient-to-b from-teal-800 to-teal-700 px-4 py-5 text-white">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <TravelLogo />
          <p className="text-sm font-bold leading-tight">Travel Plan Portal</p>
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
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-auto rounded-md border border-white/20 px-3 py-2 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </aside>

      <main className="min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
