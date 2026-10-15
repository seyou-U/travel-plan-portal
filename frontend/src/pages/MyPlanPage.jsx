import { useLocation } from 'react-router-dom';

export default function MyPlanPage() {
  const location = useLocation();

  return (
    <section className="p-6 sm:p-8">
      {location.state?.successMessage ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-800"
        >
          {location.state.successMessage}
        </div>
      ) : null}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">マイプラン</h1>
        <p className="mt-3 text-sm text-slate-600">
          保存した旅行プラン一覧を表示する画面です。次のステップで一覧UIを接続できます。
        </p>
      </div>
    </section>
  );
}
