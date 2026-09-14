export const TRAVEL_PLAN_ITEM_TYPES = [
  { value: 'spot', label: '観光' },
  { value: 'meal', label: '食事' },
  { value: 'hotel', label: '宿泊' },
  { value: 'transport', label: '移動' },
];

export const TRANSPORTATION_TYPES = [
  { value: 'walk', label: '徒歩' },
  { value: 'train', label: '電車' },
  { value: 'bus', label: 'バス' },
  { value: 'car', label: '車' },
  { value: 'taxi', label: 'タクシー' },
  { value: 'plane', label: '飛行機' },
  { value: 'bicycle', label: '自転車' },
  { value: 'other', label: 'その他' },
];

export const ITEM_TYPE_LABELS = Object.fromEntries(
  TRAVEL_PLAN_ITEM_TYPES.map(({ value, label }) => [value, label]),
);

export const TRANSPORTATION_TYPE_LABELS = Object.fromEntries(
  TRANSPORTATION_TYPES.map(({ value, label }) => [value, label]),
);
