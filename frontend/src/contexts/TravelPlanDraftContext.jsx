import { useEffect, useMemo, useState } from 'react';
import { PREFECTURE_CODES } from '../constants/prefectures';
import { addDaysToDate } from '../utils/travelPlanDates';
import { TravelPlanDraftContext } from './travel-plan-draft-context';

export const TRAVEL_PLAN_DRAFT_STORAGE_KEY = 'travel-plan-draft:v1';

function isValidDraft(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.title === 'string' &&
    value.title.trim().length >= 1 &&
    value.title.length <= 50 &&
    typeof value.start_date === 'string' &&
    addDaysToDate(value.start_date, 0) === value.start_date &&
    Number.isInteger(value.days_count) &&
    value.days_count >= 1 &&
    value.days_count <= 31 &&
    Number.isInteger(value.budget_per_person) &&
    value.budget_per_person >= 0 &&
    value.budget_per_person <= 10000000 &&
    Array.isArray(value.days) &&
    value.days.length === value.days_count &&
    value.days.every(
      (day, index) =>
        day !== null &&
        typeof day === 'object' &&
        day.day_number === index + 1 &&
        typeof day.prefecture_code === 'string' &&
        (day.prefecture_code === '' || PREFECTURE_CODES.has(day.prefecture_code)) &&
        Array.isArray(day.items),
    )
  );
}

function restoreDraft() {
  try {
    const saved = sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (isValidDraft(parsed)) return parsed;
  } catch {
    // 壊れたDraftは破棄して新規入力へ戻す。
  }

  sessionStorage.removeItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY);
  return null;
}

export function TravelPlanDraftProvider({ children }) {
  const [draft, setDraft] = useState(restoreDraft);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  useEffect(() => {
    try {
      if (draft) {
        sessionStorage.setItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } else {
        sessionStorage.removeItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY);
      }
    } catch {
      // Storageが利用できない環境でもメモリ上のDraftは継続して使用する。
    }
  }, [draft]);

  const value = useMemo(() => {
    const createDraft = ({ title, start_date, days_count, budget_per_person }) => {
      const newDraft = {
        title,
        start_date,
        days_count,
        budget_per_person,
        days: Array.from({ length: days_count }, (_, index) => ({
          day_number: index + 1,
          prefecture_code: '',
          items: [],
        })),
      };
      setDraft(newDraft);
      setSelectedDayNumber(1);
      return newDraft;
    };

    const updateBasicInfo = (values) => {
      setDraft((current) => (current ? { ...current, ...values } : current));
    };

    const selectDay = (dayNumber) => {
      if (draft?.days.some((day) => day.day_number === dayNumber)) {
        setSelectedDayNumber(dayNumber);
      }
    };

    const updateDayPrefecture = (dayNumber, prefectureCode) => {
      if (prefectureCode !== '' && !PREFECTURE_CODES.has(prefectureCode)) return;
      setDraft((current) =>
        current
          ? {
              ...current,
              days: current.days.map((day) =>
                day.day_number === dayNumber ? { ...day, prefecture_code: prefectureCode } : day,
              ),
            }
          : current,
      );
    };

    const discardDraft = () => {
      setDraft(null);
      setSelectedDayNumber(1);
    };

    return {
      draft,
      selectedDayNumber,
      selectedDay: draft?.days.find((day) => day.day_number === selectedDayNumber) ?? null,
      createDraft,
      updateBasicInfo,
      selectDay,
      updateDayPrefecture,
      discardDraft,
    };
  }, [draft, selectedDayNumber]);

  return (
    <TravelPlanDraftContext.Provider value={value}>{children}</TravelPlanDraftContext.Provider>
  );
}
