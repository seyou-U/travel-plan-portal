import { useDroppable } from '@dnd-kit/core';

export function DroppableDayTab({ day, selected, onSelect }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-tab:${day.day_number}`,
    data: { type: 'day', dayNumber: day.day_number },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      role="tab"
      aria-label={`Day ${day.day_number}`}
      aria-selected={selected}
      onClick={onSelect}
      className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
        isOver
          ? 'border-amber-500 bg-amber-50 text-amber-800'
          : selected
            ? 'border-teal-700 bg-teal-50/60 text-teal-800'
            : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      Day {day.day_number}
      <span className="ml-1.5 text-[11px] font-semibold opacity-70">({day.items.length})</span>
    </button>
  );
}
