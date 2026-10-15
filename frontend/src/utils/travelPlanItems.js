import { ITEM_TYPE_LABELS, TRANSPORTATION_TYPE_LABELS } from '../constants/travelPlanItems';
import { PREFECTURE_CODES } from '../constants/prefectures';
import { addDaysToDate } from './travelPlanDates';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function integerValue(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) return null;
  return Number(value);
}

export function createInitialItemForm() {
  return {
    item_type: 'spot',
    title: '',
    spot_name: '',
    start_time: '09:00',
    stay_minutes: '60',
    transportation_type: null,
    travel_minutes: '0',
    transportation_cost: '0',
    visit_cost: '0',
    memo: '',
  };
}

export function changeItemType(values, itemType) {
  if (itemType === 'transport') {
    return {
      ...values,
      item_type: itemType,
      spot_name: '',
      stay_minutes: '0',
      visit_cost: '0',
      transportation_type: 'walk',
      travel_minutes: '15',
      transportation_cost: '0',
    };
  }

  return {
    ...values,
    item_type: itemType,
    stay_minutes: '60',
    visit_cost: '0',
    transportation_type: null,
    travel_minutes: '0',
    transportation_cost: '0',
  };
}

export function validateItemForm(values) {
  const errors = {};
  const itemTypes = ['spot', 'meal', 'hotel', 'transport'];

  if (!itemTypes.includes(values.item_type)) errors.item_type = '予定種別を選択してください。';
  if (!values.title.trim()) errors.title = 'タイトルを入力してください。';
  else if (values.title.length > 255) errors.title = 'タイトルは255文字以内で入力してください。';
  if (!TIME_PATTERN.test(values.start_time))
    errors.start_time = '開始時間を正しく入力してください。';
  if (values.memo.length > 255) errors.memo = 'メモは255文字以内で入力してください。';
  if (values.spot_name.length > 255)
    errors.spot_name = 'スポット名は255文字以内で入力してください。';

  if (values.item_type === 'transport') {
    const travelMinutes = integerValue(values.travel_minutes);
    const transportationCost = integerValue(values.transportation_cost);
    if (travelMinutes === null) errors.travel_minutes = '移動時間は整数で入力してください。';
    else if (travelMinutes < 1) errors.travel_minutes = '移動時間は1分以上で入力してください。';
    if (!TRANSPORTATION_TYPE_LABELS[values.transportation_type])
      errors.transportation_type = '移動手段を選択してください。';
    if (transportationCost === null)
      errors.transportation_cost = '移動費は整数で入力してください。';
    else if (transportationCost < 0)
      errors.transportation_cost = '移動費は0円以上で入力してください。';
  } else {
    const stayMinutes = integerValue(values.stay_minutes);
    const visitCost = integerValue(values.visit_cost);
    if (stayMinutes === null) errors.stay_minutes = '滞在時間は整数で入力してください。';
    else if (stayMinutes < 1) errors.stay_minutes = '滞在時間は1分以上で入力してください。';
    if (visitCost === null) errors.visit_cost = '予定費用は整数で入力してください。';
    else if (visitCost < 0) errors.visit_cost = '予定費用は0円以上で入力してください。';
  }

  return errors;
}

export function toDraftItem(values) {
  const transport = values.item_type === 'transport';
  return {
    spot_id: null,
    item_type: values.item_type,
    title: values.title.trim(),
    spot_name: transport ? null : values.spot_name.trim() || null,
    start_time: values.start_time,
    stay_minutes: transport ? 0 : Number(values.stay_minutes),
    transportation_type: transport ? values.transportation_type : null,
    travel_minutes: transport ? Number(values.travel_minutes) : 0,
    transportation_cost: transport ? Number(values.transportation_cost) : 0,
    visit_cost: transport ? 0 : Number(values.visit_cost),
    memo: values.memo.trim() || null,
  };
}

export function isValidDraftItem(item) {
  if (
    item === null ||
    typeof item !== 'object' ||
    !ITEM_TYPE_LABELS[item.item_type] ||
    typeof item.title !== 'string' ||
    item.title.trim().length === 0 ||
    item.title.length > 255 ||
    !TIME_PATTERN.test(item.start_time) ||
    (item.spot_id !== null && !Number.isInteger(item.spot_id)) ||
    (item.spot_name !== null &&
      (typeof item.spot_name !== 'string' || item.spot_name.length > 255)) ||
    (item.memo !== null && (typeof item.memo !== 'string' || item.memo.length > 255)) ||
    !Number.isInteger(item.stay_minutes) ||
    !Number.isInteger(item.travel_minutes) ||
    !Number.isInteger(item.transportation_cost) ||
    !Number.isInteger(item.visit_cost)
  ) {
    return false;
  }

  if (item.item_type === 'transport') {
    return (
      item.stay_minutes === 0 &&
      item.visit_cost === 0 &&
      item.travel_minutes >= 1 &&
      item.transportation_cost >= 0 &&
      Boolean(TRANSPORTATION_TYPE_LABELS[item.transportation_type])
    );
  }

  return (
    item.stay_minutes >= 1 &&
    item.visit_cost >= 0 &&
    item.transportation_type === null &&
    item.travel_minutes === 0 &&
    item.transportation_cost === 0
  );
}

export function validateDraftForSave(draft) {
  const errors = [];
  if (!draft) return ['旅行プランの入力内容がありません。'];
  if (typeof draft.title !== 'string' || !draft.title.trim() || draft.title.length > 50)
    errors.push('プラン名を確認してください。');
  if (addDaysToDate(draft.start_date, 0) !== draft.start_date)
    errors.push('旅行開始日を確認してください。');
  if (!Number.isInteger(draft.days_count) || draft.days_count < 1 || draft.days_count > 31)
    errors.push('旅行日数を確認してください。');
  if (
    !Number.isInteger(draft.budget_per_person) ||
    draft.budget_per_person < 0 ||
    draft.budget_per_person > 10000000
  )
    errors.push('1人当たり予算を確認してください。');
  if (!Array.isArray(draft.days) || draft.days.length !== draft.days_count) {
    errors.push('旅行日数とDayの件数が一致していません。');
    return errors;
  }

  draft.days.forEach((day, dayIndex) => {
    if (day.day_number !== dayIndex + 1)
      errors.push(`Day ${dayIndex + 1}の並び順を確認してください。`);
    if (!PREFECTURE_CODES.has(day.prefecture_code))
      errors.push(`Day ${dayIndex + 1}の都道府県を選択してください。`);
    day.items.forEach((item, itemIndex) => {
      if (!isValidDraftItem(item))
        errors.push(`Day ${dayIndex + 1}の予定${itemIndex + 1}を確認してください。`);
    });
  });
  return errors;
}

export function buildStorePlanPayload(draft) {
  return {
    title: draft.title,
    start_date: draft.start_date,
    days_count: draft.days_count,
    budget_per_person: draft.budget_per_person,
    days: draft.days.map((day) => ({
      day_number: day.day_number,
      prefecture_code: day.prefecture_code,
      items: day.items.map((item) => ({
        spot_id: item.spot_id,
        item_type: item.item_type,
        title: item.title,
        spot_name: item.spot_name,
        start_time: item.start_time,
        stay_minutes: item.stay_minutes,
        transportation_type: item.transportation_type,
        travel_minutes: item.travel_minutes,
        transportation_cost: item.transportation_cost,
        visit_cost: item.visit_cost,
        memo: item.memo,
      })),
    })),
  };
}

export function calculateItemEndTime(item) {
  if (!TIME_PATTERN.test(item.start_time)) return '';
  const [hours, minutes] = item.start_time.split(':').map(Number);
  const duration = item.item_type === 'transport' ? item.travel_minutes : item.stay_minutes;
  const totalMinutes = hours * 60 + minutes + duration;
  return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

export function itemTypeLabel(item) {
  return ITEM_TYPE_LABELS[item.item_type] ?? item.item_type;
}

export function itemDetailLabel(item) {
  if (item.item_type === 'transport') {
    return `${TRANSPORTATION_TYPE_LABELS[item.transportation_type]}・${item.travel_minutes}分・${item.transportation_cost.toLocaleString('ja-JP')}円`;
  }
  return `${item.stay_minutes}分・${item.visit_cost.toLocaleString('ja-JP')}円`;
}

export function formatApiValidationErrors(apiErrors) {
  if (!apiErrors || typeof apiErrors !== 'object') return [];
  return Object.entries(apiErrors).flatMap(([path, messages]) => {
    const match = /^days\.(\d+)(?:\.items\.(\d+))?/.exec(path);
    const location = match
      ? `Day ${Number(match[1]) + 1}${match[2] === undefined ? '' : `の予定${Number(match[2]) + 1}`}: `
      : '';
    return (Array.isArray(messages) ? messages : [messages]).map(
      (message) => `${location}${message}`,
    );
  });
}

export function isStoredDraftDateValid(draft) {
  return addDaysToDate(draft.start_date, 0) === draft.start_date;
}
