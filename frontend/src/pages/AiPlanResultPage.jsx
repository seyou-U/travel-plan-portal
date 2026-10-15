import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PlanItemCard } from '../components/plans/PlanItemCard';
import { useAiPlan } from '../contexts/useAiPlan';
import { useTravelPlanSave } from '../hooks/useTravelPlanSave';
import { normalizeAiResult } from '../utils/aiPlans';
import { addDaysToDate, formatJapaneseDate } from '../utils/travelPlanDates';

export default function AiPlanResultPage() {
  const navigate = useNavigate();
  const { form, result, retryGeneration, clearAiPlan } = useAiPlan();
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const normalized = useMemo(() => normalizeAiResult(result, form), [form, result]);
  const { isSaving, saveErrors, saveTravelPlan } = useTravelPlanSave({
    beforeDiscard: () => {
      setSaveCompleted(true);
      clearAiPlan();
    },
  });

  if (!result) {
    if (saveCompleted) return null;
    return <Navigate to="/plans/new/ai" replace />;
  }

  const draft = normalized.draft;
  const selectedDay = draft?.days.find((day) => day.day_number === selectedDayNumber);
  const regenerate = () => {
    retryGeneration();
    navigate('/plans/new/ai');
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-teal-50/40 via-[#f5f7f8] to-[#f5f7f8] px-4 py-8 sm:px-7 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-bold tracking-[0.14em] text-teal-700">AI PLAN RESULT</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">旅程が完成しました</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            内容を確認してから旅行プランとして登録してください。まだ保存はされていません。
          </p>
        </div>

        {normalized.errors.length > 0 ? (
          <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="font-black text-rose-800">生成結果を保存形式へ変換できません</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-700">
              {normalized.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={regenerate}
              className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-200"
            >
              入力画面へ戻って再生成する
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{draft.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{result.summary}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs text-slate-500">1人当たり予算</p>
                  <p className="mt-1 font-black text-slate-800">
                    {draft.budget_per_person.toLocaleString('ja-JP')}円
                  </p>
                </div>
              </div>
              <div
                className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200"
                role="tablist"
              >
                {draft.days.map((day) => (
                  <button
                    key={day.day_number}
                    type="button"
                    role="tab"
                    aria-selected={selectedDayNumber === day.day_number}
                    onClick={() => setSelectedDayNumber(day.day_number)}
                    className={`shrink-0 border-b-2 px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${selectedDayNumber === day.day_number ? 'border-teal-700 bg-teal-50/60 text-teal-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                  >
                    Day {day.day_number}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-sm font-bold text-teal-700">Day {selectedDayNumber}</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {formatJapaneseDate(addDaysToDate(draft.start_date, selectedDayNumber - 1))}
                </h3>
                <div className="mt-5 space-y-4">
                  {selectedDay.items.map((item, index) => (
                    <PlanItemCard key={`${item.start_time}-${item.title}-${index}`} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {saveErrors.length > 0 ? (
              <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-rose-700">
                  {saveErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={regenerate}
                disabled={isSaving}
                className="rounded-xl border border-teal-700 bg-white px-6 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
              >
                もう一度生成する
              </button>
              <button
                type="button"
                onClick={() => saveTravelPlan(draft)}
                disabled={isSaving}
                className="rounded-xl bg-teal-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? '保存中...' : 'このプランを登録する'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
