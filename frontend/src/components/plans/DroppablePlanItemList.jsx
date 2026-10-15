import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortablePlanItem } from './SortablePlanItem';

export function DroppablePlanItemList({ day, daysCount, onMoveByOffset, onMoveToDay }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-list:${day.day_number}`,
    data: { type: 'day', dayNumber: day.day_number },
  });
  const itemIds = day.items.map((item) => item._draft_id);

  return (
    <div
      ref={setNodeRef}
      className={`mt-9 min-h-32 rounded-2xl transition ${isOver ? 'bg-teal-50/70 ring-2 ring-dashed ring-teal-400 ring-offset-4' : ''}`}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {day.items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/80 px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-2xl text-teal-700">
              ＋
            </div>
            <h3 className="mt-4 text-base font-black text-slate-800">まだ予定がありません</h3>
            <p className="mt-2 text-sm text-slate-500">
              予定を追加するか、別のDayからここへ移動できます。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {day.items.map((item, index) => (
              <SortablePlanItem
                key={item._draft_id}
                item={item}
                dayNumber={day.day_number}
                index={index}
                itemCount={day.items.length}
                daysCount={daysCount}
                onMoveByOffset={onMoveByOffset}
                onMoveToDay={onMoveToDay}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  );
}
