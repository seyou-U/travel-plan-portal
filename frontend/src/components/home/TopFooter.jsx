export function TopFooter() {
  return (
      <footer className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <a className="inline-flex items-center gap-2 text-base font-bold" href="/">
            <span className="text-xs text-teal-600" aria-hidden="true">●</span>
            <span>Travel Plan Portal</span>
          </a>
          <small className="text-xs text-slate-400">© 2026 Travel Plan Portal Inc.</small>
        </div>
      </footer>
  );
}
