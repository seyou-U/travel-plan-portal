import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAiPlan } from '../contexts/useAiPlan';
import { fetchAiPlanResult, fetchAiPlanStatus } from '../features/ai/aiPlans';

const POLLING_INTERVAL_MS = 2000;

export default function AiPlanLoadingPage() {
  const navigate = useNavigate();
  const { requestId, completeRequest, retryGeneration } = useAiPlan();
  const [status, setStatus] = useState('queued');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!requestId) return undefined;
    const controller = new AbortController();
    let timeoutId;

    const poll = async () => {
      try {
        const response = await fetchAiPlanStatus(requestId, { signal: controller.signal });
        setStatus(response.status);
        if (response.status === 'completed') {
          const resultResponse = await fetchAiPlanResult(requestId, { signal: controller.signal });
          completeRequest(resultResponse.result);
          navigate('/plans/new/ai/result', { replace: true });
          return;
        }
        if (response.status === 'failed') {
          setErrorMessage(response.error?.message ?? '旅程の生成に失敗しました。');
          return;
        }
        timeoutId = window.setTimeout(poll, POLLING_INTERVAL_MS);
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (error.status === 401)
          setErrorMessage('認証の有効期限が切れました。再度ログインしてください。');
        else if (error.status === 429)
          setErrorMessage('利用回数上限に達しました。時間を置いてお試しください。');
        else
          setErrorMessage('生成状況を取得できませんでした。入力画面へ戻って再試行してください。');
      }
    };
    poll();
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [completeRequest, navigate, requestId]);

  if (!requestId) return <Navigate to="/plans/new/ai" replace />;

  const returnToForm = () => {
    retryGeneration();
    navigate('/plans/new/ai', { replace: true });
  };

  return (
    <section className="grid min-h-screen place-items-center bg-[#f1f6f7] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
        {errorMessage ? (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-2xl text-rose-600">
              !
            </div>
            <h1 className="mt-5 text-xl font-black text-slate-900">旅程を生成できませんでした</h1>
            <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={returnToForm}
              className="mt-7 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              入力画面へ戻る
            </button>
          </>
        ) : (
          <>
            <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-teal-50">
              <span className="absolute inset-2 animate-ping rounded-full bg-teal-100 opacity-50" />
              <span className="relative text-3xl text-teal-700">◇</span>
            </div>
            <h1 className="mt-6 text-2xl font-black text-slate-900">旅程を生成中...</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              AIが旅行条件に合わせて旅程を作成しています。
              <br />
              しばらくお待ちください。
            </p>
            <div className="mt-7 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              状態：{status === 'processing' ? '生成処理中' : 'リクエスト受付済み'}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
