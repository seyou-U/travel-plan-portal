import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from '../contexts/useAuth';
import { useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, EmailIcon, LockIcon, EyeIcon } from '../components/icons';
import mountainAndForestScenery from '../images/mountain-and-forest-scenery.png';

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
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
      await register(formValues);
      navigate('/top', { replace: true });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, '新規登録に失敗しました。入力内容を確認してください。'),
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
          <div className="relative overflow-hidden rounded-lg">
            <img
              className="h-20 w-full object-cover"
              src={mountainAndForestScenery}
              alt="山と森の景色"
            />
            <div className="absolute inset-0 bg-slate-900/30" />
            <h1 className="absolute inset-0 grid place-items-center text-3xl font-black text-white">
              新規登録
            </h1>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="register-name"
              >
                お名前
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <UserIcon />
                </span>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  className={inputClassName}
                  placeholder="例：山田 太郎"
                  value={formValues.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="register-email"
              >
                メールアドレス
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <EmailIcon />
                </span>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  className={inputClassName}
                  placeholder="example@travelplan.jp"
                  value={formValues.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold text-slate-700"
                htmlFor="register-password"
              >
                パスワード（8文字以上）
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <LockIcon />
                </span>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={inputClassName}
                  placeholder="8文字以上の英数字"
                  value={formValues.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
                htmlFor="register-password-confirmation"
              >
                パスワード（確認用）
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <LockIcon />
                </span>
                <input
                  id="register-password-confirmation"
                  name="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  className={inputClassName}
                  placeholder="同じパスワードを入力"
                  value={formValues.password_confirmation}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              {submitting ? '登録中...' : 'アカウントを作成する'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            すでにアカウントをお持ちですか？{' '}
            <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800">
              ログインはこちら
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
