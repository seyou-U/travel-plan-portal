import { calculateItemEndTime, itemDetailLabel, itemTypeLabel } from '../../utils/travelPlanItems';

export function PlanItemCard({ item }) {
  const endTime = calculateItemEndTime(item);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        <div
          aria-label={`${item.start_time}から${endTime}`}
          className="min-w-20 text-sm font-black text-teal-800"
        >
          {item.start_time}
          <span className="mx-1 text-slate-300">–</span>
          {endTime}
        </div>
        <div className="min-w-0 flex-1 border-l-2 border-teal-100 pl-4">
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
            {itemTypeLabel(item)}
          </span>
          <h3 className="mt-2 text-base font-black text-slate-900">{item.title}</h3>
          {item.spot_name ? <p className="mt-1 text-sm text-slate-600">{item.spot_name}</p> : null}
          <p className="mt-2 text-xs font-semibold text-slate-500">{itemDetailLabel(item)}</p>
          {item.memo ? <p className="mt-3 text-sm leading-6 text-slate-500">{item.memo}</p> : null}
        </div>
      </div>
    </article>
  );
}
