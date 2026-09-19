import { useContext } from 'react';
import { AiPlanContext } from './ai-plan-context';

export function useAiPlan() {
  const context = useContext(AiPlanContext);
  if (!context) throw new Error('useAiPlan must be used within an AiPlanProvider');
  return context;
}
