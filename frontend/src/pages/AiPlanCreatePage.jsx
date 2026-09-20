import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PREFECTURES } from '../constants/prefectures';
import { useAiPlan } from '../contexts/useAiPlan';
import { generateAiPlan } from '../features/ai/aiPlans';
import { buildAiGeneratePayload, formatAiApiErrors, validateAiPlanForm } from '../utils/aiPlans';

const PREFERENCES = ['自然', 'グルメ', '歴史', 'アート', 'アウトドア', 'ショッピング'];

export default function AiPlanCreatePage() {
  const navigate = useNavigate();
  const { form, updateForm, startRequest } = useAiPlan();
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const updateValue = (event) => {
    const { name, value } = event.target;
    updateForm({ ...form, [name]: value });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const togglePreference = (preference) => {
    const selected = form.preferences.includes(preference);
    updateForm({
      ...form,
      preferences: selected
        ? form.preferences.filter((value) => value !== preference)
        : [...form.preferences, preference],
    });
    setErrors((current) => ({ ...current, preferences: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const validationErrors = validateAiPlanForm(form);
    setErrors(validationErrors);
    setRequestError('');
    if (Object.keys(validationErrors).length > 0) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await generateAiPlan(buildAiGeneratePayload(form));
      startRequest(response.request_id);
      navigate('/plans/new/ai/loading');
    } catch (error) {
      if (error.status === 422) setErrors(formatAiApiErrors(error.data?.errors));
      else if (error.status === 429)
        setRequestError('AI旅程生成の利用回数上限に達しました。時間を置いてお試しください。');
      else if (error.status === 401)
        setRequestError('認証の有効期限が切れました。再度ログインしてください。');
      else
        setRequestError('生成依頼を開始できませんでした。通信状況を確認して再試行してください。');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `mt-1.5 w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
      errors[name]
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-200 focus:border-teal-600 focus:ring-teal-100'
    }`;
  const error = (name) =>
    errors[name] ? (
      <p className="mt-1 text-xs font-semibold text-rose-600">{errors[name]}</p>
    ) : null;

  return (
    <section className="min-h-screen bg-[#f5f7f8] px-4 py-8 sm:px-7 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">AI TRAVEL PLANNER</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">AIで旅程を作成</h1>
        <p className="mt-2 text-sm text-slate-500">
          旅行条件を入力すると、AIが日ごとの旅程案を作成します。
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {requestError ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              {requestError}
            </div>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ai_prefecture" className="text-sm font-bold text-slate-700">
                行き先
              </label>
              <select
                id="ai_prefecture"
                name="prefecture"
                value={form.prefecture}
                onChange={updateValue}
                className={fieldClass('prefecture')}
              >
                <option value="">都道府県を選択</option>
                {PREFECTURES.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              {error('prefecture')}
            </div>
            <div>
              <label htmlFor="departure_location" className="text-sm font-bold text-slate-700">
                出発地
              </label>
              <input
                id="departure_location"
                name="departure_location"
                value={form.departure_location}
                onChange={updateValue}
                placeholder="例：東京駅"
                className={fieldClass('departure_location')}
              />
              {error('departure_location')}
            </div>
            <div>
              <label htmlFor="ai_start_date" className="text-sm font-bold text-slate-700">
                出発日
              </label>
              <input
                id="ai_start_date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={updateValue}
                className={fieldClass('start_date')}
              />
              {error('start_date')}
            </div>
            <div>
              <label htmlFor="ai_end_date" className="text-sm font-bold text-slate-700">
                帰着日
              </label>
              <input
                id="ai_end_date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={updateValue}
                className={fieldClass('end_date')}
              />
              {error('end_date')}
            </div>
            <div>
              <label htmlFor="number_of_people" className="text-sm font-bold text-slate-700">
                旅行人数
              </label>
              <input
                id="number_of_people"
                name="number_of_people"
                type="number"
                min="1"
                max="20"
                step="1"
                value={form.number_of_people}
                onChange={updateValue}
                className={fieldClass('number_of_people')}
              />
              {error('number_of_people')}
            </div>
            <div>
              <label htmlFor="ai_budget" className="text-sm font-bold text-slate-700">
                1人当たり予算（円）
              </label>
              <input
                id="ai_budget"
                name="budget"
                type="number"
                min="0"
                max="10000000"
                step="1"
                value={form.budget}
                onChange={updateValue}
                className={fieldClass('budget')}
              />
              {error('budget')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="transport_priority" className="text-sm font-bold text-slate-700">
                移動方針
              </label>
              <select
                id="transport_priority"
                name="transport_priority"
                value={form.transport_priority}
                onChange={updateValue}
                className={fieldClass('transport_priority')}
              >
                <option value="おまかせ">おまかせ</option>
                <option value="費用">費用を優先</option>
                <option value="時間">時間を優先</option>
              </select>
              {error('transport_priority')}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-bold text-slate-700">興味・旅行テーマ（任意）</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREFERENCES.map((preference) => (
                  <button
                    key={preference}
                    type="button"
                    aria-pressed={form.preferences.includes(preference)}
                    onClick={() => togglePreference(preference)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${form.preferences.includes(preference) ? 'border-teal-700 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-teal-300'}`}
                  >
                    {preference}
                  </button>
                ))}
              </div>
              {error('preferences')}
            </fieldset>
            <div className="sm:col-span-2">
              <label htmlFor="ai_notes" className="text-sm font-bold text-slate-700">
                旅行の希望・備考（任意）
              </label>
              <textarea
                id="ai_notes"
                name="notes"
                rows="5"
                value={form.notes}
                onChange={updateValue}
                placeholder="例：子どもと楽しめる場所を入れてほしい、移動時間を短めにしたい"
                className={fieldClass('notes')}
              />
              {error('notes')}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 w-full rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? '生成依頼中...' : 'AIで旅程を生成する'}
          </button>
        </form>
      </div>
    </section>
  );
}
