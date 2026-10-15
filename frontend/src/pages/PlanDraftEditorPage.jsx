import { useCallback, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Navigate, useNavigate } from 'react-router-dom';
import { DroppableDayTab } from '../components/plans/DroppableDayTab';
import { DroppablePlanItemList } from '../components/plans/DroppablePlanItemList';
import { PlanItemCard } from '../components/plans/PlanItemCard';
import { PlanItemModal } from '../components/plans/PlanItemModal';
import { PREFECTURES } from '../constants/prefectures';
import { useTravelPlanDraft } from '../contexts/useTravelPlanDraft';
import { useTravelPlanSave } from '../hooks/useTravelPlanSave';
import { addDaysToDate, calculateEndDate, formatJapaneseDate } from '../utils/travelPlanDates';

export default function PlanDraftEditorPage() {
  const navigate = useNavigate();
  const {
    draft,
    selectedDayNumber,
    selectedDay,
    selectDay,
    updateDayPrefecture,
    addItem,
    moveItem,
    moveItemByOffset,
  } = useTravelPlanDraft();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const { isSaving, saveErrors, setSaveErrors, saveTravelPlan } = useTravelPlanSave({
    beforeDiscard: () => {
      setSaveCompleted(true);
    },
  });

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  if (!draft) {
    if (saveCompleted) return null;
    return (
      <Navigate
        to="/plans/new/manual"
        replace
        state={{ message: '先にプランの基本情報を入力してください。' }}
      />
    );
  }

  const selectedDate = addDaysToDate(draft.start_date, selectedDayNumber - 1);
  const endDate = calculateEndDate(draft.start_date, draft.days_count);

  const handleAddItem = (item) => {
    addItem(selectedDayNumber, item);
    setIsModalOpen(false);
    setSaveErrors([]);
  };

  const activeItem = draft.days
    .flatMap((day) => day.items)
    .find((item) => item._draft_id === activeItemId);

  const handleDragEnd = ({ active, over }) => {
    setActiveItemId(null);
    if (!over) return;

    const destinationDayNumber = over.data.current?.dayNumber;
    if (!Number.isInteger(destinationDayNumber)) return;
    const overItemId = over.data.current?.type === 'item' ? String(over.id) : null;
    moveItem(String(active.id), destinationDayNumber, overItemId);
    selectDay(destinationDayNumber);
    setSaveErrors([]);
  };

  const handleMoveToDay = (itemId, destinationDayNumber) => {
    moveItem(itemId, destinationDayNumber);
    selectDay(destinationDayNumber);
    setSaveErrors([]);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveItemId(String(active.id))}
      onDragCancel={() => setActiveItemId(null)}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            '並び替えボタンでスペースキーを押して持ち上げ、矢印キーで移動し、もう一度スペースキーで確定します。',
        },
        announcements: {
          onDragStart: ({ active }) =>
            `${active.data.current?.sortable?.index + 1}番目の予定を持ち上げました。`,
          onDragOver: ({ over }) =>
            over ? `Day ${over.data.current?.dayNumber}へ移動できます。` : 'ドロップ先の外です。',
          onDragEnd: ({ over }) =>
            over
              ? `Day ${over.data.current?.dayNumber}へ移動しました。`
              : '移動をキャンセルしました。',
          onDragCancel: () => '移動をキャンセルしました。',
        },
      }}
    >
      <section className="relative min-h-screen bg-[#f5f7f8] pb-28">
        <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate('/plans/new/manual')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                ← 基本情報へ戻る
              </button>
              <h1 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{draft.title}</h1>
              <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <div className="flex gap-1">
                  <dt>期間:</dt>
                  <dd className="font-semibold text-slate-700">
                    {formatJapaneseDate(draft.start_date)}〜{formatJapaneseDate(endDate)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>1人当たり予算:</dt>
                  <dd className="font-semibold text-slate-700">
                    {draft.budget_per_person.toLocaleString('ja-JP')}円
                  </dd>
                </div>
              </dl>
            </div>
            <button
              type="button"
              onClick={() => saveTravelPlan(draft)}
              disabled={isSaving}
              className="w-full rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSaving ? '保存中...' : 'まとめて保存'}
            </button>
          </div>

          <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
            {draft.days.map((day) => (
              <DroppableDayTab
                key={day.day_number}
                day={day}
                selected={day.day_number === selectedDayNumber}
                onSelect={() => selectDay(day.day_number)}
              />
            ))}
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="prefecture" className="text-sm font-bold text-slate-700">
              Day {selectedDayNumber}の都道府県
            </label>
            <select
              id="prefecture"
              value={selectedDay?.prefecture_code ?? ''}
              onChange={(event) => updateDayPrefecture(selectedDayNumber, event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-64"
            >
              <option value="">都道府県を選択</option>
              {PREFECTURES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-4 py-9 sm:px-7 sm:py-12">
          {saveErrors.length > 0 ? (
            <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-bold text-rose-700">保存できない項目があります</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
                {saveErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
              DAY {selectedDayNumber}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {formatJapaneseDate(selectedDate)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">この日のスケジュールを組み立てましょう</p>
            <p className="mt-2 text-xs text-slate-400">
              ⠿ ハンドルから並び替えできます。別のDayへはDayタブにドロップしてください。
            </p>
          </div>

          {selectedDay ? (
            <DroppablePlanItemList
              day={selectedDay}
              daysCount={draft.days_count}
              onMoveByOffset={(itemId, offset) => {
                moveItemByOffset(itemId, offset);
                setSaveErrors([]);
              }}
              onMoveToDay={handleMoveToDay}
            />
          ) : null}
        </main>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 z-20 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          ＋ 予定を追加
        </button>

        {isModalOpen ? (
          <PlanItemModal
            dayNumber={selectedDayNumber}
            date={selectedDate}
            onAdd={handleAddItem}
            onClose={closeModal}
          />
        ) : null}
        <DragOverlay>
          {activeItem ? (
            <div className="w-[min(42rem,calc(100vw-2rem))] rotate-1">
              <PlanItemCard item={activeItem} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </section>
    </DndContext>
  );
}
