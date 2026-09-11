function parseLocalDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString ?? '');
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function addDaysToDate(dateString, daysToAdd) {
  const date = parseLocalDate(dateString);
  if (!date) return '';

  date.setDate(date.getDate() + daysToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatJapaneseDate(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return '未設定';

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function calculateEndDate(startDate, daysCount) {
  if (!Number.isInteger(daysCount) || daysCount < 1) return '';
  return addDaysToDate(startDate, daysCount - 1);
}
