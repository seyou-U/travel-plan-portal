import { calculateItemEndTime, itemDetailLabel, itemTypeLabel } from '../../utils/travelPlanItems';

export function PlanItemCard({
  item,
  dragHandleProps,
  isDragging = false,
  canMoveUp = false,
  canMoveDown = false,
  previousDayNumber = null,
  nextDayNumber = null,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
}) {
  const endTime = calculateItemEndTime(item);

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
        isDragging
          ? 'border-teal-500 opacity-60 shadow-lg ring-2 ring-teal-100'
          : 'border-slate-200 hover:border-teal-200 hover:shadow-md'
      }`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-4">
        {dragHandleProps ? (
          <button
            type="button"
            aria-label={`${item.title}を並び替える`}
            className="row-span-2 touch-none rounded-lg p-2 text-lg font-black text-slate-400 hover:bg-slate-100 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:row-auto"
            {...dragHandleProps}
          >
            ⠿
          </button>
        ) : null}
        <div
          aria-label={`${item.start_time}から${endTime}`}
          className="text-xs font-black text-teal-800 sm:min-w-20 sm:text-sm"
        >
          {item.start_time}
          <span className="mx-1 text-slate-300">–</span>
          {endTime}
        </div>
        <div
          className={`${dragHandleProps ? 'col-span-2 sm:col-span-1' : ''} min-w-0 border-l-2 border-teal-100 pl-3 sm:pl-4`}
        >
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
            {itemTypeLabel(item)}
          </span>
          <h3 className="mt-2 text-base font-black text-slate-900">{item.title}</h3>
          {item.spot_name ? <p className="mt-1 text-sm text-slate-600">{item.spot_name}</p> : null}
          <p className="mt-2 text-xs font-semibold text-slate-500">{itemDetailLabel(item)}</p>
          {item.memo ? <p className="mt-3 text-sm leading-6 text-slate-500">{item.memo}</p> : null}
          {dragHandleProps ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs md:hidden">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                ↑ 上へ
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                ↓ 下へ
              </button>
              {previousDayNumber ? (
                <button
                  type="button"
                  onClick={() => onMoveToDay(previousDayNumber)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Day {previousDayNumber}へ
                </button>
              ) : null}
              {nextDayNumber ? (
                <button
                  type="button"
                  onClick={() => onMoveToDay(nextDayNumber)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Day {nextDayNumber}へ
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
