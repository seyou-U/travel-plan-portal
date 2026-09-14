import { useEffect, useRef, useState } from 'react';
import { TRANSPORTATION_TYPES, TRAVEL_PLAN_ITEM_TYPES } from '../../constants/travelPlanItems';
import {
  changeItemType,
  createInitialItemForm,
  toDraftItem,
  validateItemForm,
} from '../../utils/travelPlanItems';
import { formatJapaneseDate } from '../../utils/travelPlanDates';

export function PlanItemModal({ dayNumber, date, onAdd, onClose }) {
  const [values, setValues] = useState(createInitialItemForm);
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const transport = values.item_type === 'transport';

  useEffect(() => {
    titleRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleTypeChange = (event) => {
    setValues((current) => changeItemType(current, event.target.value));
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateItemForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onAdd(toDraftItem(values));
  };

  const inputClass = (name) =>
    `mt-1.5 w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
      errors[name]
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-100'
    }`;

  const error = (name) =>
    errors[name] ? (
      <p id={`${name}-error`} role="alert" className="mt-1 text-xs font-semibold text-rose-600">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-item-modal-title"
        className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 id="plan-item-modal-title" className="text-lg font-black text-slate-900">
              予定を追加
            </h2>
            <p className="mt-1 text-xs font-semibold text-teal-700">
              Day {dayNumber}・{formatJapaneseDate(date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-6">
            <div className="sm:col-span-2">
              <label htmlFor="item_type" className="text-sm font-bold text-slate-700">
                予定種別
              </label>
              <select
                id="item_type"
                name="item_type"
                value={values.item_type}
                onChange={handleTypeChange}
                className={inputClass('item_type')}
              >
                {TRAVEL_PLAN_ITEM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {error('item_type')}
            </div>

            <div>
              <label htmlFor="item_title" className="text-sm font-bold text-slate-700">
                タイトル
              </label>
              <input
                ref={titleRef}
                id="item_title"
                name="title"
                value={values.title}
                onChange={updateValue}
                placeholder={transport ? '例：京都駅から大阪駅へ移動' : '例：清水寺を拝観'}
                className={inputClass('title')}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {error('title')}
            </div>

            <div>
              <label htmlFor="start_time" className="text-sm font-bold text-slate-700">
                開始時間
              </label>
              <input
                id="start_time"
                name="start_time"
                type="time"
                value={values.start_time}
                onChange={updateValue}
                className={inputClass('start_time')}
              />
              {error('start_time')}
            </div>

            {!transport ? (
              <>
                <div>
                  <label htmlFor="spot_name" className="text-sm font-bold text-slate-700">
                    スポット名（任意）
                  </label>
                  <input
                    id="spot_name"
                    name="spot_name"
                    value={values.spot_name}
                    onChange={updateValue}
                    placeholder="例：清水寺"
                    className={inputClass('spot_name')}
                  />
                  {error('spot_name')}
                </div>
                <div>
                  <label htmlFor="stay_minutes" className="text-sm font-bold text-slate-700">
                    滞在時間（分）
                  </label>
                  <input
                    id="stay_minutes"
                    name="stay_minutes"
                    type="number"
                    min="1"
                    step="1"
                    value={values.stay_minutes}
                    onChange={updateValue}
                    className={inputClass('stay_minutes')}
                  />
                  {error('stay_minutes')}
                </div>
                <div>
                  <label htmlFor="visit_cost" className="text-sm font-bold text-slate-700">
                    予定費用（1人当たり・円）
                  </label>
                  <input
                    id="visit_cost"
                    name="visit_cost"
                    type="number"
                    min="0"
                    step="1"
                    value={values.visit_cost}
                    onChange={updateValue}
                    className={inputClass('visit_cost')}
                  />
                  {error('visit_cost')}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="transportation_type" className="text-sm font-bold text-slate-700">
                    移動手段
                  </label>
                  <select
                    id="transportation_type"
                    name="transportation_type"
                    value={values.transportation_type ?? ''}
                    onChange={updateValue}
                    className={inputClass('transportation_type')}
                  >
                    {TRANSPORTATION_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {error('transportation_type')}
                </div>
                <div>
                  <label htmlFor="travel_minutes" className="text-sm font-bold text-slate-700">
                    移動時間（分）
                  </label>
                  <input
                    id="travel_minutes"
                    name="travel_minutes"
                    type="number"
                    min="1"
                    step="1"
                    value={values.travel_minutes}
                    onChange={updateValue}
                    className={inputClass('travel_minutes')}
                  />
                  {error('travel_minutes')}
                </div>
                <div>
                  <label htmlFor="transportation_cost" className="text-sm font-bold text-slate-700">
                    移動費（1人当たり・円）
                  </label>
                  <input
                    id="transportation_cost"
                    name="transportation_cost"
                    type="number"
                    min="0"
                    step="1"
                    value={values.transportation_cost}
                    onChange={updateValue}
                    className={inputClass('transportation_cost')}
                  />
                  {error('transportation_cost')}
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="memo" className="text-sm font-bold text-slate-700">
                メモ（任意）
              </label>
              <textarea
                id="memo"
                name="memo"
                value={values.memo}
                onChange={updateValue}
                rows="3"
                placeholder="持ち物や予約情報など"
                className={inputClass('memo')}
              />
              {error('memo')}
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800"
            >
              追加する
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
