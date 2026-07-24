import { getErrorMessage } from '../utils/getErrorMessage';
import { resetPassword } from '../features/auth/auth';
import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { EyeIcon, LockIcon } from '../components/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const hasResetToken = Boolean(token && email);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formValues, setFormValues] = useState({
    password: '',
    password_confirmation: '',
  });

  const handleChange = (event) => {
    setFormValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await resetPassword({
        email,
        token,
        ...formValues,
      });
      navigate('/login', {
        replace: true,
        state: {
          resetMessage: response?.message ?? 'パスワードを再設定しました。',
        },
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'パスワードの再設定に失敗しました。入力内容を確認してください。'),
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
          <h1 className="text-2xl font-black tracking-tight">パスワード再設定</h1>

          {hasResetToken ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                  htmlFor="reset-password"
                >
                  新しいパスワード（8文字以上）
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <LockIcon />
                  </span>
                  <input
                    id="reset-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={inputClassName}
                    placeholder="8文字以上のパスワード"
                    value={formValues.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={255}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    aria-label="パスワードの表示切り替え"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <EyeIcon />
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                  htmlFor="reset-password-confirmation"
                >
                  パスワード（確認用）
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <LockIcon />
                  </span>
                  <input
                    id="reset-password-confirmation"
                    name="password_confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    className={inputClassName}
                    placeholder="同じパスワードを入力"
                    value={formValues.password_confirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={255}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    aria-label="確認用パスワードの表示切り替え"
                    onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  >
                    <EyeIcon />
                  </button>
                </div>
              </div>

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
                {submitting ? '再設定中...' : 'パスワードを再設定する'}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">
              パスワード再設定リンクが見つかりません。
            </p>
          )}

          <p className="mt-6 text-xs text-slate-500">
            <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800">
              ログイン画面に戻る
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
