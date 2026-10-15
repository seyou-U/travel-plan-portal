let fallbackId = 0;

export function createDraftItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  fallbackId += 1;
  return `draft-item-${Date.now()}-${fallbackId}`;
}

export function withDraftItemId(item) {
  return typeof item._draft_id === 'string' && item._draft_id
    ? item
    : { ...item, _draft_id: createDraftItemId() };
}

export function ensureDraftItemIds(draft) {
  if (!draft) return draft;

  return {
    ...draft,
    days: draft.days.map((day) => ({
      ...day,
      items: day.items.map(withDraftItemId),
    })),
  };
}

export function moveDraftItem(draft, activeId, destinationDayNumber, overItemId = null) {
  if (!draft || typeof activeId !== 'string') return draft;

  const sourceDay = draft.days.find((day) => day.items.some((item) => item._draft_id === activeId));
  const destinationDay = draft.days.find((day) => day.day_number === destinationDayNumber);
  if (!sourceDay || !destinationDay) return draft;

  const sourceIndex = sourceDay.items.findIndex((item) => item._draft_id === activeId);
  const movingItem = sourceDay.items[sourceIndex];

  if (sourceDay.day_number === destinationDayNumber) {
    if (!overItemId || overItemId === activeId) return draft;
    const destinationIndex = sourceDay.items.findIndex((item) => item._draft_id === overItemId);
    if (destinationIndex < 0) return draft;
    const items = [...sourceDay.items];
    items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, movingItem);
    return {
      ...draft,
      days: draft.days.map((day) =>
        day.day_number === sourceDay.day_number ? { ...day, items } : day,
      ),
    };
  }

  const days = draft.days.map((day) => ({ ...day, items: [...day.items] }));
  const nextSource = days.find((day) => day.day_number === sourceDay.day_number);
  const nextDestination = days.find((day) => day.day_number === destinationDayNumber);
  nextSource.items.splice(sourceIndex, 1);

  let destinationIndex = nextDestination.items.length;
  if (overItemId) {
    const overIndex = nextDestination.items.findIndex((item) => item._draft_id === overItemId);
    if (overIndex >= 0) destinationIndex = overIndex;
  }

  nextDestination.items.splice(destinationIndex, 0, movingItem);
  return { ...draft, days };
}

export function moveDraftItemByOffset(draft, itemId, offset) {
  const day = draft?.days.find((candidate) =>
    candidate.items.some((item) => item._draft_id === itemId),
  );
  if (!day) return draft;

  const index = day.items.findIndex((item) => item._draft_id === itemId);
  const destinationIndex = index + offset;
  if (destinationIndex < 0 || destinationIndex >= day.items.length) return draft;

  return moveDraftItem(draft, itemId, day.day_number, day.items[destinationIndex]._draft_id);
}
