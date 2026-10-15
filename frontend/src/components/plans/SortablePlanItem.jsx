import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlanItemCard } from './PlanItemCard';

export function SortablePlanItem({
  item,
  dayNumber,
  index,
  itemCount,
  daysCount,
  onMoveByOffset,
  onMoveToDay,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._draft_id,
    data: { type: 'item', dayNumber },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative"
    >
      <PlanItemCard
        item={item}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        canMoveUp={index > 0}
        canMoveDown={index < itemCount - 1}
        previousDayNumber={dayNumber > 1 ? dayNumber - 1 : null}
        nextDayNumber={dayNumber < daysCount ? dayNumber + 1 : null}
        onMoveUp={() => onMoveByOffset(item._draft_id, -1)}
        onMoveDown={() => onMoveByOffset(item._draft_id, 1)}
        onMoveToDay={(destinationDay) => onMoveToDay(item._draft_id, destinationDay)}
      />
    </div>
  );
}
