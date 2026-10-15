import { apiFetch } from '../../lib/api';

export async function generateAiPlan(payload, { signal } = {}) {
  const response = await apiFetch('/api/ai/plans/generate', {
    method: 'POST',
    body: payload,
    signal,
  });
  return response.data;
}

export async function fetchAiPlanStatus(requestId, { signal } = {}) {
  const response = await apiFetch(`/api/ai/requests/${requestId}`, { signal });
  return response.data;
}

export async function fetchAiPlanResult(requestId, { signal } = {}) {
  const response = await apiFetch(`/api/ai/requests/${requestId}/result`, { signal });
  return response.data;
}
