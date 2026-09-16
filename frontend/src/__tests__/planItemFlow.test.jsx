import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TravelPlanDraftProvider,
  TRAVEL_PLAN_DRAFT_STORAGE_KEY,
} from '../contexts/TravelPlanDraftContext';
import PlanDraftEditorPage from '../pages/PlanDraftEditorPage';
import MyPlanPage from '../pages/MyPlanPage';
import { storeTravelPlan } from '../features/plans/plans';

vi.mock('../features/plans/plans', () => ({ storeTravelPlan: vi.fn() }));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function validDraft() {
  return {
    title: '京都・大阪旅行',
    start_date: '2026-10-10',
    days_count: 2,
    budget_per_person: 80000,
    days: [
      { day_number: 1, prefecture_code: '26', items: [] },
      { day_number: 2, prefecture_code: '27', items: [] },
    ],
  };
}

function renderEditor(draft = validDraft()) {
  sessionStorage.setItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return render(
    <TravelPlanDraftProvider>
      <MemoryRouter initialEntries={['/plans/new/editor']}>
        <Routes>
          <Route path="/plans/new/editor" element={<PlanDraftEditorPage />} />
          <Route path="/plan" element={<MyPlanPage />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </TravelPlanDraftProvider>,
  );
}

async function openModal(user) {
  await user.click(screen.getByRole('button', { name: '＋ 予定を追加' }));
  return screen.getByRole('dialog', { name: '予定を追加' });
}

describe('予定追加モーダルとDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('モーダルを開き、キャンセルではDraftを変更しない', async () => {
    const user = userEvent.setup();
    const draft = validDraft();
    renderEditor(draft);

    const dialog = await openModal(user);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Day 1・2026年10月10日')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toHaveFocus();
    await user.type(screen.getByLabelText('タイトル'), '保存しない予定');
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY))).toEqual(draft);
  });

  it('必須エラー時は閉じず、通常予定を選択中Dayだけへ追加する', async () => {
    const user = userEvent.setup();
    renderEditor();
    await openModal(user);

    await user.clear(screen.getByLabelText('タイトル'));
    await user.click(screen.getByRole('button', { name: '追加する' }));
    expect(screen.getByText('タイトルを入力してください。')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('まだ予定がありません')).toBeInTheDocument();

    await user.type(screen.getByLabelText('タイトル'), '清水寺');
    await user.type(screen.getByLabelText('スポット名（任意）'), '清水寺');
    await user.clear(screen.getByLabelText('予定費用（1人当たり・円）'));
    await user.type(screen.getByLabelText('予定費用（1人当たり・円）'), '500');
    await user.click(screen.getByRole('button', { name: '追加する' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('まだ予定がありません')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '清水寺' })).toBeInTheDocument();
    expect(screen.getByLabelText('09:00から10:00')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Day 2' }));
    expect(screen.queryByText('清水寺')).not.toBeInTheDocument();
    expect(screen.getByText('まだ予定がありません')).toBeInTheDocument();

    await waitFor(() => {
      const saved = JSON.parse(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY));
      expect(saved.days[0].items[0]).toMatchObject({
        item_type: 'spot',
        title: '清水寺',
        stay_minutes: 60,
        transportation_type: null,
        travel_minutes: 0,
        transportation_cost: 0,
        visit_cost: 500,
      });
      expect(saved.days[1].items).toEqual([]);
    });
  });

  it('移動を独立予定として追加し、種別変更時に不要値をリセットする', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('tab', { name: 'Day 2' }));
    await openModal(user);

    await user.selectOptions(screen.getByLabelText('予定種別'), 'transport');
    await user.type(screen.getByLabelText('タイトル'), '大阪へ移動');
    await user.selectOptions(screen.getByLabelText('移動手段'), 'train');
    await user.clear(screen.getByLabelText('移動時間（分）'));
    await user.type(screen.getByLabelText('移動時間（分）'), '45');
    await user.clear(screen.getByLabelText('移動費（1人当たり・円）'));
    await user.type(screen.getByLabelText('移動費（1人当たり・円）'), '800');

    await user.selectOptions(screen.getByLabelText('予定種別'), 'spot');
    expect(screen.queryByLabelText('移動費（1人当たり・円）')).not.toBeInTheDocument();
    expect(screen.getByLabelText('滞在時間（分）')).toHaveValue(60);
    await user.selectOptions(screen.getByLabelText('予定種別'), 'transport');
    expect(screen.getByLabelText('移動費（1人当たり・円）')).toHaveValue(0);
    expect(screen.getByLabelText('移動時間（分）')).toHaveValue(15);
    await user.selectOptions(screen.getByLabelText('移動手段'), 'train');
    await user.clear(screen.getByLabelText('移動時間（分）'));
    await user.type(screen.getByLabelText('移動時間（分）'), '45');
    await user.click(screen.getByRole('button', { name: '追加する' }));

    expect(screen.getByText('大阪へ移動')).toBeInTheDocument();
    expect(screen.getByLabelText('09:00から09:45')).toBeInTheDocument();
    const saved = JSON.parse(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY));
    expect(saved.days[1].items[0]).toEqual({
      spot_id: null,
      item_type: 'transport',
      title: '大阪へ移動',
      spot_name: null,
      start_time: '09:00',
      stay_minutes: 0,
      transportation_type: 'train',
      travel_minutes: 45,
      transportation_cost: 0,
      visit_cost: 0,
      memo: null,
    });
  });

  it('Escapeキーと背景クリックでモーダルを閉じる', async () => {
    const user = userEvent.setup();
    renderEditor();
    await openModal(user);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openModal(user);
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('旅行プラン最終保存', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正しいpayloadを1回だけ送信し、成功後にDraftを削除してマイプランへ遷移する', async () => {
    let resolveRequest;
    storeTravelPlan.mockImplementation(() => new Promise((resolve) => (resolveRequest = resolve)));
    const user = userEvent.setup();
    const draft = validDraft();
    draft.days[0].items.push({
      spot_id: null,
      item_type: 'spot',
      title: '清水寺',
      spot_name: '清水寺',
      start_time: '09:00',
      stay_minutes: 60,
      transportation_type: null,
      travel_minutes: 0,
      transportation_cost: 0,
      visit_cost: 500,
      memo: null,
    });
    renderEditor(draft);

    const saveButton = screen.getByRole('button', { name: 'まとめて保存' });
    await user.click(saveButton);
    fireEvent.click(saveButton);
    expect(storeTravelPlan).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled();
    expect(storeTravelPlan.mock.calls[0][0]).toEqual(draft);
    expect(storeTravelPlan.mock.calls[0][0]).not.toHaveProperty('uuid');
    expect(storeTravelPlan.mock.calls[0][0]).not.toHaveProperty('user_id');

    resolveRequest({ uuid: '11111111-1111-4111-8111-111111111111' });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/plan$/));
    expect(await screen.findByText('旅行プランを保存しました。')).toBeInTheDocument();
    await waitFor(() => expect(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY)).toBeNull());
  });

  it('保存前エラーではAPIを呼ばず修正対象Dayを表示する', async () => {
    const user = userEvent.setup();
    const draft = validDraft();
    draft.days[1].prefecture_code = '';
    renderEditor(draft);

    await user.click(screen.getByRole('button', { name: 'まとめて保存' }));
    expect(storeTravelPlan).not.toHaveBeenCalled();
    expect(screen.getByText('Day 2の都道府県を選択してください。')).toBeInTheDocument();
  });

  it('422エラーをDay・予定付きで表示し、Draftを保持して再試行できる', async () => {
    const validationError = Object.assign(new Error('validation'), {
      status: 422,
      data: { errors: { 'days.0.items.0.title': ['タイトルが不正です。'] } },
    });
    storeTravelPlan.mockRejectedValueOnce(validationError).mockResolvedValueOnce({ uuid: 'uuid' });
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole('button', { name: 'まとめて保存' }));
    expect(await screen.findByText('Day 1の予定1: タイトルが不正です。')).toBeInTheDocument();
    expect(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByRole('button', { name: 'まとめて保存' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'まとめて保存' }));
    await waitFor(() => expect(storeTravelPlan).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['500エラー', Object.assign(new Error('server'), { status: 500 })],
    ['ネットワークエラー', new Error('network')],
  ])('%s後もDraftと予定を保持する', async (_, error) => {
    storeTravelPlan.mockRejectedValue(error);
    const user = userEvent.setup();
    const draft = validDraft();
    renderEditor(draft);

    await user.click(screen.getByRole('button', { name: 'まとめて保存' }));
    expect(await screen.findByText(/保存に失敗しました/)).toBeInTheDocument();
    expect(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByRole('button', { name: 'まとめて保存' })).toBeEnabled();
  });
});
