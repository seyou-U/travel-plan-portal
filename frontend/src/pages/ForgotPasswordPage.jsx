import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { EmailIcon } from '../components/icons';
import { requestPasswordReset } from '../features/auth/auth';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../utils/getErrorMessage';

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await requestPasswordReset({ email });
      setSuccessMessage(
        response?.message ??
          '入力されたメールアドレスに、パスワード再設定メールを送信しました。',
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'メールの送信に失敗しました。時間をおいて再度お試しください。'),
      );
    } finally {
      setSubmitting(false);
    }
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

            {successMessage ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-700/30 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? '送信中...' : '再設定メールを送信する'}
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
