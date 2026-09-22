import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { matchRoutes, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AI_PLAN_STORAGE_KEY } from '../constants/aiPlans';
import { AiPlanProvider } from '../contexts/AiPlanContext';
import { TravelPlanDraftProvider } from '../contexts/TravelPlanDraftContext';
import { fetchAiPlanResult, fetchAiPlanStatus, generateAiPlan } from '../features/ai/aiPlans';
import { storeTravelPlan } from '../features/plans/plans';
import AiPlanCreatePage from '../pages/AiPlanCreatePage';
import AiPlanLoadingPage from '../pages/AiPlanLoadingPage';
import AiPlanResultPage from '../pages/AiPlanResultPage';
import MyPlanPage from '../pages/MyPlanPage';
import TopPage from '../pages/TopPage';
import { appRoutes } from '../routes';
import { normalizeAiResult } from '../utils/aiPlans';

vi.mock('../features/ai/aiPlans', () => ({
  generateAiPlan: vi.fn(),
  fetchAiPlanStatus: vi.fn(),
  fetchAiPlanResult: vi.fn(),
}));
vi.mock('../features/plans/plans', () => ({ storeTravelPlan: vi.fn() }));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const aiForm = {
  prefecture: '13',
  start_date: '2099-10-10',
  end_date: '2099-10-10',
  departure_location: '東京駅',
  number_of_people: '2',
  budget: '50000',
  transport_priority: 'おまかせ',
  preferences: ['グルメ'],
  notes: '徒歩を少なめにしたい',
};

const aiResult = {
  title: '東京を楽しむ1日旅',
  summary: '東京の名所と食事を楽しむ旅程です。',
  destination: '東京都',
  start_date: '2099-10-10',
  end_date: '2099-10-10',
  estimated_budget: 42000,
  days: [
    {
      day_number: 1,
      date: '2099-10-10',
      title: '東京観光',
      items: [
        {
          sort_order: 1,
          item_type: 'transport',
          title: '浅草へ移動',
          start_time: '09:00',
          stay_minutes: 30,
          visit_cost: 0,
          transportation_type: 'train',
          transportation_cost: 300,
          memo: null,
        },
        {
          sort_order: 2,
          item_type: 'spot',
          title: '浅草寺',
          start_time: '09:30',
          stay_minutes: 60,
          visit_cost: 0,
          transportation_type: null,
          transportation_cost: 0,
          memo: '雷門から参拝',
        },
      ],
    },
  ],
};

function seedAiState({ requestId = null, result = null } = {}) {
  sessionStorage.setItem(AI_PLAN_STORAGE_KEY, JSON.stringify({ form: aiForm, requestId, result }));
}

function renderAiRoutes(initialEntry = '/plans/new/ai') {
  return render(
    <TravelPlanDraftProvider>
      <AiPlanProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/top" element={<TopPage />} />
            <Route path="/plans/new/ai" element={<AiPlanCreatePage />} />
            <Route path="/plans/new/ai/loading" element={<AiPlanLoadingPage />} />
            <Route path="/plans/new/ai/result" element={<AiPlanResultPage />} />
            <Route path="/plan" element={<MyPlanPage />} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AiPlanProvider>
    </TravelPlanDraftProvider>,
  );
}

describe('AI旅程作成フロー', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('実際のアプリルーターがAI作成URLに一致する', () => {
    const matches = matchRoutes(appRoutes, '/plans/new/ai');

    expect(matches).not.toBeNull();
    expect(matches.at(-1).route.path).toBe('ai');
  });

  it('ホームのAIアシスタントから入力画面へ遷移する', async () => {
    const user = userEvent.setup();
    renderAiRoutes('/top');

    await user.click(screen.getByRole('button', { name: 'AIアシスタント' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/plans/new/ai');
    expect(screen.getByRole('heading', { name: 'AIで旅程を作成' })).toBeInTheDocument();
  });

  it('必須エラーでは生成APIを呼ばない', async () => {
    const user = userEvent.setup();
    renderAiRoutes();

    await user.click(screen.getByRole('button', { name: 'AIで旅程を生成する' }));

    expect(screen.getByText('行き先を選択してください。')).toBeInTheDocument();
    expect(screen.getByText('出発地を入力してください。')).toBeInTheDocument();
    expect(generateAiPlan).not.toHaveBeenCalled();
  });

  it('生成依頼を一度だけ送り、入力状態を保持して待機画面へ進む', async () => {
    let resolveRequest;
    generateAiPlan.mockImplementation(() => new Promise((resolve) => (resolveRequest = resolve)));
    seedAiState();
    renderAiRoutes();

    const button = screen.getByRole('button', { name: 'AIで旅程を生成する' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(generateAiPlan).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '生成依頼中...' })).toBeDisabled();
    expect(generateAiPlan).toHaveBeenCalledWith({
      prefecture: '13',
      start_date: '2099-10-10',
      end_date: '2099-10-10',
      departure_location: '東京駅',
      number_of_people: 2,
      budget: 50000,
      transport_priority: 'おまかせ',
      preferences: ['グルメ'],
      notes: '徒歩を少なめにしたい',
    });

    fetchAiPlanStatus.mockResolvedValue({ status: 'queued' });
    resolveRequest({ request_id: 42, status: 'queued' });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/loading'));
    expect(JSON.parse(sessionStorage.getItem(AI_PLAN_STORAGE_KEY)).form).toEqual(aiForm);
  });

  it('完了をポーリングして結果を取得し、確定前には保存しない', async () => {
    seedAiState({ requestId: 42 });
    fetchAiPlanStatus.mockResolvedValue({ status: 'completed' });
    fetchAiPlanResult.mockResolvedValue({ request_id: 42, status: 'completed', result: aiResult });
    renderAiRoutes('/plans/new/ai/loading');

    expect(screen.getByRole('heading', { name: '旅程を生成中...' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/result'));
    expect(await screen.findByText('東京を楽しむ1日旅')).toBeInTheDocument();
    expect(storeTravelPlan).not.toHaveBeenCalled();
  });

  it('移動予定と通常予定を保存用Draftへ正規化する', () => {
    const { draft, errors } = normalizeAiResult(aiResult, aiForm);

    expect(errors).toEqual([]);
    expect(draft.days[0].items[0]).toMatchObject({
      item_type: 'transport',
      stay_minutes: 0,
      travel_minutes: 30,
      transportation_type: 'train',
      transportation_cost: 300,
      visit_cost: 0,
    });
    expect(draft.days[0].items[1]).toMatchObject({
      item_type: 'spot',
      spot_name: '浅草寺',
      stay_minutes: 60,
      transportation_type: null,
      travel_minutes: 0,
      transportation_cost: 0,
    });
  });

  it('確定時だけ一度保存し、成功後にAI状態を削除する', async () => {
    let resolveSave;
    storeTravelPlan.mockImplementation(() => new Promise((resolve) => (resolveSave = resolve)));
    seedAiState({ requestId: 42, result: aiResult });
    const user = userEvent.setup();
    renderAiRoutes('/plans/new/ai/result');

    const button = screen.getByRole('button', { name: 'このプランを登録する' });
    await user.click(button);
    fireEvent.click(button);

    expect(storeTravelPlan).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(AI_PLAN_STORAGE_KEY)).not.toBeNull();
    resolveSave({ uuid: '11111111-1111-4111-8111-111111111111' });

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/plan$/));
    expect(await screen.findByText('旅行プランを保存しました。')).toBeInTheDocument();
    await waitFor(() => expect(sessionStorage.getItem(AI_PLAN_STORAGE_KEY)).toBeNull());
  });

  it('保存失敗時は生成結果を保持して再試行できる', async () => {
    storeTravelPlan.mockRejectedValue(new Error('network'));
    seedAiState({ requestId: 42, result: aiResult });
    const user = userEvent.setup();
    renderAiRoutes('/plans/new/ai/result');

    await user.click(screen.getByRole('button', { name: 'このプランを登録する' }));

    expect(await screen.findByText(/保存に失敗しました/)).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(AI_PLAN_STORAGE_KEY)).result).toEqual(aiResult);
    expect(screen.getByRole('button', { name: 'このプランを登録する' })).toBeEnabled();
  });
});
