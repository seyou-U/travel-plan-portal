import { useContext } from 'react';
import { TravelPlanDraftContext } from './travel-plan-draft-context';

export function useTravelPlanDraft() {
  const context = useContext(TravelPlanDraftContext);
  if (!context) {
    throw new Error('useTravelPlanDraft must be used within a TravelPlanDraftProvider');
  }
  return context;
}
