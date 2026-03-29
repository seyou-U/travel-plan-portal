import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from '../contexts/useAuth';
import { useEffect, useState } from 'react';
import { BrandHeader } from '../components/BrandHeader';
import { EmailIcon, LockIcon, EyeIcon } from '../components/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoutMessage] = useState(
    () => location.state?.logoutMessage ?? sessionStorage.getItem('logoutMessage') ?? '',
  );
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (logoutMessage) {
      sessionStorage.removeItem('logoutMessage');
    }
  }, [logoutMessage]);

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
      await login(formValues);
      navigate('/top', { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'ログインに失敗しました。入力内容を確認してください。'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      {logoutMessage ? (
        <div className="mx-auto w-full py-4 max-w-2xl">
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {logoutMessage}
          </p>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <BrandHeader />
        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-300/40">
          <h1 className="text-center text-2xl font-black tracking-tight">ログイン</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                  name="email"
                  type="email"
                  className={inputClassName}
                  placeholder="example@travelplan.com"
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={inputClassName}
                  placeholder="********"
                  value={formValues.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
              {submitting ? 'ログイン中...' : 'ログインする'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-xs">
            <a href="#" className="text-slate-500 hover:text-teal-700">
              パスワードを忘れた方はこちら
            </a>
            <p className="text-slate-500">
              アカウントをお持ちでないですか？{' '}
              <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800">
                新規登録はこちら
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
