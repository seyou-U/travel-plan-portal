import { useEffect, useMemo, useState } from 'react';
import { AI_PLAN_STORAGE_KEY, createInitialAiPlanForm } from '../constants/aiPlans';
import { AiPlanContext } from './ai-plan-context';

function restoreState() {
  try {
    const value = JSON.parse(sessionStorage.getItem(AI_PLAN_STORAGE_KEY));
    if (value && typeof value === 'object' && value.form && typeof value.form === 'object') {
      return {
        form: { ...createInitialAiPlanForm(), ...value.form },
        requestId: Number.isInteger(value.requestId) ? value.requestId : null,
        result: value.result && typeof value.result === 'object' ? value.result : null,
      };
    }
  } catch {
    sessionStorage.removeItem(AI_PLAN_STORAGE_KEY);
  }
  return { form: createInitialAiPlanForm(), requestId: null, result: null };
}

export function AiPlanProvider({ children }) {
  const [state, setState] = useState(restoreState);
  const [storageEnabled, setStorageEnabled] = useState(true);

  useEffect(() => {
    if (!storageEnabled) {
      sessionStorage.removeItem(AI_PLAN_STORAGE_KEY);
      return;
    }
    try {
      sessionStorage.setItem(AI_PLAN_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorageが利用できなくても、メモリ上ではフローを継続する。
    }
  }, [state, storageEnabled]);

  const value = useMemo(
    () => ({
      ...state,
      updateForm: (form) => {
        setStorageEnabled(true);
        setState((current) => ({ ...current, form }));
      },
      startRequest: (requestId) => {
        setStorageEnabled(true);
        setState((current) => ({ ...current, requestId, result: null }));
      },
      completeRequest: (result) => {
        setStorageEnabled(true);
        setState((current) => ({ ...current, result }));
      },
      retryGeneration: () => {
        setStorageEnabled(true);
        setState((current) => ({ ...current, requestId: null, result: null }));
      },
      clearAiPlan: () => {
        setStorageEnabled(false);
        setState({ form: createInitialAiPlanForm(), requestId: null, result: null });
        sessionStorage.removeItem(AI_PLAN_STORAGE_KEY);
      },
    }),
    [state],
  );

  return <AiPlanContext.Provider value={value}>{children}</AiPlanContext.Provider>;
}
