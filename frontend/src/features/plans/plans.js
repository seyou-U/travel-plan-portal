import { apiFetch } from '../../lib/api';

export function storeTravelPlan(payload) {
  return apiFetch('/api/plans', { method: 'POST', body: payload });
}
