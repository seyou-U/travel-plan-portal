import { Link } from 'react-router-dom';

export function TopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a className="inline-flex items-center gap-2 text-lg font-bold" href="/">
          <span className="text-sm text-teal-600" aria-hidden="true">
            ●
          </span>
          <span>Travel Plan Portal</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            type="button"
          >
            ログイン
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
            type="button"
          >
            新規登録
          </Link>
        </div>
      </div>
    </header>
  );
}
