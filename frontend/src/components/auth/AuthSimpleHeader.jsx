import { Link } from 'react-router-dom';

export function AuthSimpleHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center gap-2 text-lg font-bold" to="/">
          <span className="text-sm text-teal-600" aria-hidden="true">
            ●
          </span>
          <span>Travel Plan Portal</span>
        </Link>
      </div>
    </header>
  );
}
