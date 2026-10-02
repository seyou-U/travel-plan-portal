import { describe, expect, it } from 'vitest';
import { ensureDraftItemIds, moveDraftItem, moveDraftItemByOffset } from '../utils/planDraftItems';
import { buildStorePlanPayload } from '../utils/travelPlanItems';

function item(id, title, startTime) {
  return {
    _draft_id: id,
    spot_id: null,
    item_type: 'spot',
    title,
    spot_name: title,
    start_time: startTime,
    stay_minutes: 60,
    transportation_type: null,
    travel_minutes: 0,
    transportation_cost: 0,
    visit_cost: 500,
    memo: `${title}のメモ`,
  };
}

function draft() {
  return {
    title: '並び替え旅行',
    start_date: '2026-10-10',
    days_count: 2,
    budget_per_person: 50000,
    days: [
      {
        day_number: 1,
        prefecture_code: '13',
        items: [
          item('a', '予定A', '09:00'),
          item('b', '予定B', '10:00'),
          item('c', '予定C', '11:00'),
        ],
      },
      { day_number: 2, prefecture_code: '14', items: [] },
    ],
  };
}

const titles = (value, dayIndex = 0) => value.days[dayIndex].items.map(({ title }) => title);

describe('PlanDraftの予定移動', () => {
  it('同じDay内で先頭・中間・末尾へ並び替えられる', () => {
    const movedToStart = moveDraftItem(draft(), 'c', 1, 'a');
    expect(titles(movedToStart)).toEqual(['予定C', '予定A', '予定B']);

    const movedToMiddle = moveDraftItem(draft(), 'a', 1, 'b');
    expect(titles(movedToMiddle)).toEqual(['予定B', '予定A', '予定C']);

    const movedToEnd = moveDraftItem(draft(), 'a', 1, 'c');
    expect(titles(movedToEnd)).toEqual(['予定B', '予定C', '予定A']);
  });

  it('空のDayへ移動し、予定の値を変更しない', () => {
    const original = draft().days[0].items[1];
    const moved = moveDraftItem(draft(), 'b', 2);

    expect(titles(moved)).toEqual(['予定A', '予定C']);
    expect(moved.days[1].items).toEqual([original]);
  });

  it('移動先がない操作は元のDraftを変更しない', () => {
    const original = draft();

    expect(moveDraftItem(original, 'a', 99)).toBe(original);
    expect(moveDraftItem(original, 'unknown', 1)).toBe(original);
    expect(moveDraftItemByOffset(original, 'a', -1)).toBe(original);
  });

  it('上下移動で配列順を更新する', () => {
    const movedDown = moveDraftItemByOffset(draft(), 'a', 1);
    expect(titles(movedDown)).toEqual(['予定B', '予定A', '予定C']);

    const movedUp = moveDraftItemByOffset(draft(), 'c', -1);
    expect(titles(movedUp)).toEqual(['予定A', '予定C', '予定B']);
  });

  it('復元した予定へ安定IDを付け、保存payloadには含めない', () => {
    const withoutIds = draft();
    withoutIds.days[0].items = withoutIds.days[0].items.map((draftItem) => {
      const itemWithoutId = { ...draftItem };
      delete itemWithoutId._draft_id;
      return itemWithoutId;
    });
    const restored = ensureDraftItemIds(withoutIds);
    const payload = buildStorePlanPayload(
      moveDraftItem(
        restored,
        restored.days[0].items[2]._draft_id,
        1,
        restored.days[0].items[0]._draft_id,
      ),
    );

    expect(restored.days[0].items.every(({ _draft_id }) => typeof _draft_id === 'string')).toBe(
      true,
    );
    expect(payload.days[0].items.map(({ title }) => title)).toEqual(['予定C', '予定A', '予定B']);
    expect(payload.days[0].items.every((savedItem) => !('_draft_id' in savedItem))).toBe(true);
  });
});
