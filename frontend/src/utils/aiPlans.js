import { PREFECTURE_CODES } from '../constants/prefectures';
import { isValidDraftItem } from './travelPlanItems';
import { addDaysToDate } from './travelPlanDates';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TRANSPORTATION_TYPES = new Set([
  'walk',
  'train',
  'bus',
  'car',
  'taxi',
  'plane',
  'bicycle',
  'other',
]);
const ITEM_TYPES = new Set(['spot', 'meal', 'hotel', 'transport']);

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function integer(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  return Number(value);
}

export function validateAiPlanForm(form) {
  const errors = {};
  const people = integer(form.number_of_people);
  const budget = integer(form.budget);

  if (!PREFECTURE_CODES.has(form.prefecture)) errors.prefecture = '行き先を選択してください。';
  if (addDaysToDate(form.start_date, 0) !== form.start_date)
    errors.start_date = '出発日を入力してください。';
  else if (form.start_date < todayString())
    errors.start_date = '出発日は本日以降の日付を入力してください。';
  if (addDaysToDate(form.end_date, 0) !== form.end_date)
    errors.end_date = '帰着日を入力してください。';
  else if (form.end_date < form.start_date) errors.end_date = '帰着日は出発日以降にしてください。';
  else if (addDaysToDate(form.start_date, 30) < form.end_date)
    errors.end_date = '旅行期間は31日以内で指定してください。';
  if (!form.departure_location.trim()) errors.departure_location = '出発地を入力してください。';
  else if (form.departure_location.length > 100)
    errors.departure_location = '出発地は100文字以内で入力してください。';
  if (people === null || people < 1 || people > 20)
    errors.number_of_people = '旅行人数は1人以上20人以下の整数で入力してください。';
  if (budget === null || budget < 0 || budget > 10000000)
    errors.budget = '予算は0円以上10,000,000円以下の整数で入力してください。';
  if (!['おまかせ', '費用', '時間'].includes(form.transport_priority))
    errors.transport_priority = '移動方針を選択してください。';
  if (!Array.isArray(form.preferences) || form.preferences.length > 10)
    errors.preferences = '希望条件は10件以内で選択してください。';
  else if (form.preferences.some((preference) => preference.length > 100))
    errors.preferences = '希望条件は1件につき100文字以内にしてください。';
  if (form.notes.length > 1000) errors.notes = '備考は1,000文字以内で入力してください。';
  return errors;
}

export function buildAiGeneratePayload(form) {
  return {
    prefecture: form.prefecture,
    start_date: form.start_date,
    end_date: form.end_date,
    departure_location: form.departure_location.trim(),
    number_of_people: Number(form.number_of_people),
    budget: Number(form.budget),
    transport_priority: form.transport_priority,
    preferences: form.preferences,
    notes: form.notes.trim() || null,
  };
}

function expectedDays(startDate, endDate) {
  for (let count = 1; count <= 31; count += 1) {
    if (addDaysToDate(startDate, count - 1) === endDate) return count;
  }
  return null;
}

export function normalizeAiResult(result, form) {
  const errors = [];
  const daysCount = expectedDays(form.start_date, form.end_date);
  if (!result || typeof result !== 'object')
    return { draft: null, errors: ['生成結果の形式が不正です。'] };
  if (typeof result.title !== 'string' || !result.title.trim() || result.title.length > 50)
    errors.push('生成されたプラン名が50文字を超えているか、未入力です。');
  if (result.start_date !== form.start_date || result.end_date !== form.end_date)
    errors.push('生成結果の旅行期間が入力条件と一致しません。');
  if (!Array.isArray(result.days) || result.days.length !== daysCount)
    errors.push('生成結果の日数が入力した旅行期間と一致しません。');

  const normalizedDays = Array.isArray(result.days)
    ? result.days.map((day, dayIndex) => {
        if (
          day?.day_number !== dayIndex + 1 ||
          day?.date !== addDaysToDate(form.start_date, dayIndex)
        )
          errors.push(`Day ${dayIndex + 1}の日付または並び順が不正です。`);
        if (!Array.isArray(day?.items)) {
          errors.push(`Day ${dayIndex + 1}の予定形式が不正です。`);
          return { day_number: dayIndex + 1, prefecture_code: form.prefecture, items: [] };
        }

        const items = day.items.map((item, itemIndex) => {
          if (
            !item ||
            item.sort_order !== itemIndex + 1 ||
            !ITEM_TYPES.has(item.item_type) ||
            typeof item.title !== 'string' ||
            !TIME_PATTERN.test(item.start_time) ||
            !Number.isInteger(item.stay_minutes) ||
            item.stay_minutes < 1 ||
            !Number.isInteger(item.visit_cost) ||
            item.visit_cost < 0 ||
            !Number.isInteger(item.transportation_cost) ||
            item.transportation_cost < 0 ||
            (item.memo !== null && typeof item.memo !== 'string') ||
            (typeof item.memo === 'string' && item.memo.length > 255)
          ) {
            errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}に不正な値があります。`);
            return null;
          }

          const transport = item.item_type === 'transport';
          if (transport && !TRANSPORTATION_TYPES.has(item.transportation_type))
            errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}の移動手段が不正です。`);
          if (transport && item.visit_cost !== 0)
            errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}の観光費が矛盾しています。`);
          if (!transport && (item.transportation_type !== null || item.transportation_cost !== 0))
            errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}の移動項目が矛盾しています。`);

          const normalized = {
            spot_id: null,
            item_type: item.item_type,
            title: item.title,
            spot_name: transport ? null : item.title,
            start_time: item.start_time,
            stay_minutes: transport ? 0 : item.stay_minutes,
            transportation_type: transport ? item.transportation_type : null,
            travel_minutes: transport ? item.stay_minutes : 0,
            transportation_cost: transport ? item.transportation_cost : 0,
            visit_cost: transport ? 0 : item.visit_cost,
            memo: item.memo,
          };
          if (!isValidDraftItem(normalized))
            errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}を保存形式へ変換できません。`);
          return normalized;
        });
        return {
          day_number: dayIndex + 1,
          prefecture_code: form.prefecture,
          items: items.filter(Boolean),
        };
      })
    : [];

  if (errors.length > 0) return { draft: null, errors: [...new Set(errors)] };
  return {
    errors: [],
    draft: {
      title: result.title.trim(),
      start_date: form.start_date,
      days_count: daysCount,
      budget_per_person: Number(form.budget),
      days: normalizedDays,
    },
  };
}

export function formatAiApiErrors(apiErrors) {
  if (!apiErrors || typeof apiErrors !== 'object') return {};
  return Object.fromEntries(
    Object.entries(apiErrors).map(([key, messages]) => [
      key.split('.')[0],
      Array.isArray(messages) ? messages[0] : String(messages),
    ]),
  );
}
