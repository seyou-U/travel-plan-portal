import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  TravelPlanDraftProvider,
  TRAVEL_PLAN_DRAFT_STORAGE_KEY,
} from '../contexts/TravelPlanDraftContext';
import { useTravelPlanDraft } from '../contexts/useTravelPlanDraft';
import ManualPlanCreatePage from '../pages/ManualPlanCreatePage';
import PlanDraftEditorPage from '../pages/PlanDraftEditorPage';
import TopPage from '../pages/TopPage';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderDraftRoutes(initialEntry = '/plans/new/manual') {
  return render(
    <TravelPlanDraftProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/top" element={<TopPage />} />
          <Route path="/plans/new/manual" element={<ManualPlanCreatePage />} />
          <Route path="/plans/new/editor" element={<PlanDraftEditorPage />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </TravelPlanDraftProvider>,
  );
}

async function fillAndSubmitForm({ days = '3' } = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/プラン名/), '瀬戸内の旅');
  fireEvent.change(screen.getByLabelText(/開始日/), { target: { value: '2026-10-10' } });
  await user.clear(screen.getByLabelText(/旅行日数/));
  await user.type(screen.getByLabelText(/旅行日数/), days);
  await user.clear(screen.getByLabelText(/1人当たり予算/));
  await user.type(screen.getByLabelText(/1人当たり予算/), '120000');
  await user.click(screen.getByRole('button', { name: /旅程の編集へ/ }));
}

describe('旅行プランDraftフロー', () => {
  it('ホームの既存表示を維持し、予定を追加から手動作成画面へ遷移する', async () => {
    const user = userEvent.setup();
    renderDraftRoutes('/top');

    expect(screen.getByRole('heading', { name: '九州縦断3泊4日の旅' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AIアシスタント' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '＋ 予定を追加' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/plans/new/manual');
  });

  it('必須項目のエラーを表示して最初の項目へフォーカスする', async () => {
    const user = userEvent.setup();
    renderDraftRoutes();

    await user.clear(screen.getByLabelText(/旅行日数/));
    await user.clear(screen.getByLabelText(/1人当たり予算/));
    await user.click(screen.getByRole('button', { name: /旅程の編集へ/ }));

    expect(screen.getByText('プラン名を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('開始日を入力してください。')).toBeInTheDocument();
    expect(screen.getByText('旅行日数は整数で入力してください。')).toBeInTheDocument();
    expect(screen.getByText('予算は整数で入力してください。')).toBeInTheDocument();
    expect(screen.getByLabelText(/プラン名/)).toHaveFocus();
  });

  it('日数分の連番Dayを作り、APIを呼ばず編集画面へ遷移する', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderDraftRoutes();

    await fillAndSubmitForm();

    expect(screen.getByTestId('location')).toHaveTextContent('/plans/new/editor');
    expect(screen.getByText('瀬戸内の旅')).toBeInTheDocument();
    expect(screen.getByText('2026年10月10日〜2026年10月12日')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(fetchSpy).not.toHaveBeenCalled();

    const saved = JSON.parse(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY));
    expect(saved.days.map(({ day_number }) => day_number)).toEqual([1, 2, 3]);
    expect(saved.days.every(({ items }) => items.length === 0)).toBe(true);
    fetchSpy.mockRestore();
  });

  it('Dayを切り替え、都道府県コードをDraftとsessionStorageへ反映する', async () => {
    const user = userEvent.setup();
    renderDraftRoutes();
    await fillAndSubmitForm();

    await user.click(screen.getByRole('tab', { name: 'Day 2' }));
    expect(screen.getByRole('heading', { name: '2026年10月11日' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Day 2の都道府県'), '26');

    await waitFor(() => {
      const saved = JSON.parse(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY));
      expect(saved.days[1].prefecture_code).toBe('26');
    });
  });

  it('sessionStorageからDraftを復元し、保存ボタンから通信しない', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    sessionStorage.setItem(
      TRAVEL_PLAN_DRAFT_STORAGE_KEY,
      JSON.stringify({
        title: '復元する旅行',
        start_date: '2026-12-30',
        days_count: 2,
        budget_per_person: 50000,
        days: [
          { day_number: 1, prefecture_code: '13', items: [] },
          { day_number: 2, prefecture_code: '', items: [] },
        ],
      }),
    );

    renderDraftRoutes('/plans/new/editor');
    expect(screen.getByText('復元する旅行')).toBeInTheDocument();
    expect(screen.getByText('2026年12月30日〜2026年12月31日')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /まとめて保存/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /まとめて保存/ }));
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('Draftがない、または保存データが不正なら手動作成画面へ戻る', () => {
    sessionStorage.setItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY, '{broken json');
    renderDraftRoutes('/plans/new/editor');

    expect(screen.getByTestId('location')).toHaveTextContent('/plans/new/manual');
    expect(screen.getByRole('heading', { name: '新しいプランを手動で作成' })).toBeInTheDocument();
    expect(sessionStorage.getItem(TRAVEL_PLAN_DRAFT_STORAGE_KEY)).toBeNull();
  });
});

describe('Draft Context', () => {
  it('基本情報更新と破棄を提供する', async () => {
    function Probe() {
      const { draft, createDraft, updateBasicInfo, discardDraft } = useTravelPlanDraft();
      return (
        <>
          <span>{draft?.title ?? 'Draftなし'}</span>
          <button
            onClick={() =>
              createDraft({
                title: '変更前',
                start_date: '2026-11-01',
                days_count: 1,
                budget_per_person: 0,
              })
            }
          >
            作成
          </button>
          <button onClick={() => updateBasicInfo({ title: '変更後' })}>更新</button>
          <button onClick={discardDraft}>破棄</button>
        </>
      );
    }

    const user = userEvent.setup();
    render(
      <TravelPlanDraftProvider>
        <Probe />
      </TravelPlanDraftProvider>,
    );
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(screen.getByText('変更前')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '更新' }));
    expect(screen.getByText('変更後')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '破棄' }));
    expect(screen.getByText('Draftなし')).toBeInTheDocument();
  });
});
