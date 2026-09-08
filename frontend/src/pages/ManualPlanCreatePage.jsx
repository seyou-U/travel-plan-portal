import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelPlanDraft } from '../contexts/useTravelPlanDraft';
import { calculateEndDate, formatJapaneseDate } from '../utils/travelPlanDates';

function validate(values) {
  const errors = {};
  const daysCount = Number(values.days_count);
  const budget = Number(values.budget_per_person);

  if (!values.title.trim()) errors.title = 'プラン名を入力してください。';
  else if (values.title.length > 50) errors.title = 'プラン名は50文字以内で入力してください。';

  if (!values.start_date) errors.start_date = '開始日を入力してください。';

  if (values.days_count === '' || !Number.isInteger(daysCount)) {
    errors.days_count = '旅行日数は整数で入力してください。';
  } else if (daysCount < 1 || daysCount > 31) {
    errors.days_count = '旅行日数は1日から31日の範囲で入力してください。';
  }

  if (values.budget_per_person === '' || !Number.isInteger(budget)) {
    errors.budget_per_person = '予算は整数で入力してください。';
  } else if (budget < 0) {
    errors.budget_per_person = '予算は0円以上で入力してください。';
  } else if (budget > 10000000) {
    errors.budget_per_person = '予算は10,000,000円以下で入力してください。';
  }

  return errors;
}

const fields = ['title', 'start_date', 'days_count', 'budget_per_person'];

export default function ManualPlanCreatePage() {
  const navigate = useNavigate();
  const { draft, createDraft } = useTravelPlanDraft();
  const [values, setValues] = useState(() => ({
    title: draft?.title ?? '',
    start_date: draft?.start_date ?? '',
    days_count: draft?.days_count?.toString() ?? '1',
    budget_per_person: draft?.budget_per_person?.toString() ?? '0',
  }));
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  const endDate = calculateEndDate(values.start_date, Number(values.days_count));

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstError = fields.find((field) => nextErrors[field]);
    if (firstError) {
      inputRefs.current[firstError]?.focus();
      return;
    }

    createDraft({
      title: values.title.trim(),
      start_date: values.start_date,
      days_count: Number(values.days_count),
      budget_per_person: Number(values.budget_per_person),
    });
    navigate('/plans/new/editor');
  };

  const inputClass = (name) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
      errors[name]
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-100'
    }`;

  return (
    <section className="min-h-screen bg-[#f5f7f8] px-4 py-8 sm:px-7 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700">MANUAL PLAN</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            新しいプランを手動で作成
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            旅行の基本情報を入力して、日ごとの旅程づくりを始めましょう。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="title" className="text-sm font-bold text-slate-700">
              プラン名 <span className="text-rose-500">*</span>
            </label>
            <input
              ref={(node) => (inputRefs.current.title = node)}
              id="title"
              name="title"
              value={values.title}
              onChange={updateValue}
              maxLength={51}
              placeholder="例：秋の京都をめぐる3日間"
              className={inputClass('title')}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title ? (
              <p id="title-error" className="mt-1.5 text-xs font-semibold text-rose-600">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className="text-sm font-bold text-slate-700">
                開始日 <span className="text-rose-500">*</span>
              </label>
              <input
                ref={(node) => (inputRefs.current.start_date = node)}
                id="start_date"
                name="start_date"
                type="date"
                value={values.start_date}
                onChange={updateValue}
                className={inputClass('start_date')}
              />
              {errors.start_date ? (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.start_date}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="days_count" className="text-sm font-bold text-slate-700">
                旅行日数 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={(node) => (inputRefs.current.days_count = node)}
                  id="days_count"
                  name="days_count"
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  value={values.days_count}
                  onChange={updateValue}
                  className={`${inputClass('days_count')} pr-10`}
                />
                <span className="pointer-events-none absolute right-4 top-[22px] text-sm text-slate-500">
                  日
                </span>
              </div>
              {errors.days_count ? (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.days_count}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="budget_per_person" className="text-sm font-bold text-slate-700">
                1人当たり予算 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={(node) => (inputRefs.current.budget_per_person = node)}
                  id="budget_per_person"
                  name="budget_per_person"
                  type="number"
                  min="0"
                  max="10000000"
                  step="1"
                  value={values.budget_per_person}
                  onChange={updateValue}
                  className={`${inputClass('budget_per_person')} pr-10`}
                />
                <span className="pointer-events-none absolute right-4 top-[22px] text-sm text-slate-500">
                  円
                </span>
              </div>
              {errors.budget_per_person ? (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">
                  {errors.budget_per_person}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl bg-teal-50 px-4 py-3">
              <p className="text-xs font-bold text-teal-800">終了日（参考）</p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {endDate ? formatJapaneseDate(endDate) : '開始日と旅行日数から計算します'}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 px-5 py-6 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-xl text-teal-700 shadow-sm">
              ◇
            </div>
            <p className="mt-3 text-sm font-bold text-teal-800">旅の基本情報を入力してください</p>
            <p className="mt-1 text-xs text-slate-500">予定は次の画面から日ごとに追加できます。</p>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/top')}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-800"
            >
              旅程の編集へ →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
