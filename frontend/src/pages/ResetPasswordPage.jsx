import { Link, useSearchParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const hasResetToken = Boolean(searchParams.get('token'));

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <BrandHeader />

        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-5 text-center shadow-lg shadow-slate-300/40">
          <h1 className="text-2xl font-black tracking-tight">パスワード再設定</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {hasResetToken
              ? 'パスワード再設定リンクを確認しました。'
              : 'パスワード再設定リンクが見つかりません。'}
          </p>
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
