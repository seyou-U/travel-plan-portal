export const AI_PLAN_STORAGE_KEY = 'ai-plan-flow:v1';

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialAiPlanForm() {
  const today = localDateString();

  return {
    prefecture: '',
    start_date: today,
    end_date: today,
    departure_location: '',
    number_of_people: '1',
    budget: '0',
    transport_priority: 'おまかせ',
    preferences: [],
    notes: '',
  };
}
