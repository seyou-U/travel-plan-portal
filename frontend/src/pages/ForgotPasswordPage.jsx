import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { EmailIcon } from '../components/icons';
import { Link } from 'react-router-dom';

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <BrandHeader />

        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-300/40">
          <h1 className="text-center text-2xl font-black tracking-tight">パスワードをお忘れの方</h1>
          <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">
            登録されているメールアドレスを入力してください。
            <br />
            パスワード再設定の案内をお送りします。
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="forgot-password-email"
              >
                メールアドレス
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <EmailIcon />
                </span>
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  className={inputClassName}
                  placeholder="example@travelplan.jp"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-700/30 transition hover:bg-teal-700"
            >
              再設定メールを送信する
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800">
              ログイン画面に戻る
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
