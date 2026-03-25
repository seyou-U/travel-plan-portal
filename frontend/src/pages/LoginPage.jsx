const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

function BrandIcon() {
  return (
    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 shadow-md shadow-teal-700/20">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-white">
        <path d="M3.75 10.5a.75.75 0 0 1 .75-.75h7.28l-1.72-1.72a.75.75 0 1 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H4.5a.75.75 0 0 1-.75-.75ZM4.5 15a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" />
      </svg>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-slate-400">
      <path d="M3.75 5.25A2.25 2.25 0 0 0 1.5 7.5v9a2.25 2.25 0 0 0 2.25 2.25h16.5A2.25 2.25 0 0 0 22.5 16.5v-9a2.25 2.25 0 0 0-2.25-2.25H3.75Zm-.75 2.78 8.63 5.4a.75.75 0 0 0 .74 0L21 8.03V16.5a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 16.5V8.03Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-slate-400">
      <path d="M12 1.5A4.5 4.5 0 0 0 7.5 6v2.25h-.75A2.25 2.25 0 0 0 4.5 10.5v9A2.25 2.25 0 0 0 6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-.75V6A4.5 4.5 0 0 0 12 1.5Zm-3 6.75V6a3 3 0 1 1 6 0v2.25H9Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-slate-400">
      <path d="M12 5.25c-5.12 0-9.3 4.01-9.72 6.96a1.34 1.34 0 0 0 0 .58c.42 2.95 4.6 6.96 9.72 6.96s9.3-4.01 9.72-6.96a1.34 1.34 0 0 0 0-.58c-.42-2.95-4.6-6.96-9.72-6.96Zm0 11.25a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <BrandIcon />
        <p className="mt-2 text-xl font-extrabold">Travel Plan Portal</p>

        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-300/40">
          <h1 className="text-center text-2xl font-black tracking-tight">ログイン</h1>

          <form className="mt-6 space-y-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="login-email"
              >
                メールアドレス
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <EmailIcon />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className={inputClassName}
                  placeholder="example@travelplan.com"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="login-password"
              >
                パスワード
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <LockIcon />
                </span>
                <input
                  id="login-password"
                  type="password"
                  className={inputClassName}
                  placeholder="********"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  aria-label="パスワードの表示切り替え"
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                type="checkbox"
              />
              ログイン状態を保持
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-700/30 transition hover:bg-teal-700"
            >
              ログインする
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-xs">
            <a href="#" className="text-slate-500 hover:text-teal-700">
              パスワードを忘れた方はこちら
            </a>
            <p className="text-slate-500">
              アカウントをお持ちでないですか？{' '}
              <a href="/register" className="font-bold text-teal-700 hover:text-teal-800">
                新規登録はこちら
              </a>
            </p>
          </div>
        </section>

        <p className="mt-16 text-[11px] text-slate-400">
          © 2026 Travel Plan Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
