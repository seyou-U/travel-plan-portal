import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import mountainAndForestScenery from '../assets/mountain-and-forest-scenery.jpg';

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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-slate-400">
      <path d="M12 12a5.25 5.25 0 1 0 0-10.5A5.25 5.25 0 0 0 12 12ZM3 20.25a9 9 0 1 1 18 0 .75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
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

function getErrorMessage(error) {
  const fieldErrors = error?.data?.errors;

  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstFieldMessage = Object.values(fieldErrors).find(
      (messages) => Array.isArray(messages) && messages.length > 0,
    );

    if (Array.isArray(firstFieldMessage) && firstFieldMessage[0]) {
      return firstFieldMessage[0];
    }
  }

  return error?.data?.message ?? '新規登録に失敗しました。入力内容を確認してください。';
}

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
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <BrandIcon />
        <p className="mt-2 text-xl font-extrabold">Travel Plan Portal</p>

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
