import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelPlanDraft } from '../contexts/useTravelPlanDraft';
import { storeTravelPlan } from '../features/plans/plans';
import {
  buildStorePlanPayload,
  formatApiValidationErrors,
  validateDraftForSave,
} from '../utils/travelPlanItems';

export function useTravelPlanSave({ beforeDiscard } = {}) {
  const navigate = useNavigate();
  const { discardDraft } = useTravelPlanDraft();
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState([]);
  const savingRef = useRef(false);

  const saveTravelPlan = async (draft) => {
    if (savingRef.current) return null;
    const validationErrors = validateDraftForSave(draft);
    setSaveErrors(validationErrors);
    if (validationErrors.length > 0) return null;

    savingRef.current = true;
    setIsSaving(true);
    try {
      const response = await storeTravelPlan(buildStorePlanPayload(draft));
      beforeDiscard?.(response);
      discardDraft();
      navigate('/plan', {
        replace: true,
        state: {
          successMessage: '旅行プランを保存しました。',
          createdPlanUuid: response.uuid,
        },
      });
      return response;
    } catch (error) {
      if (error.status === 422) {
        const validationMessages = formatApiValidationErrors(error.data?.errors);
        setSaveErrors(
          validationMessages.length > 0
            ? validationMessages
            : ['入力内容を確認して、もう一度保存してください。'],
        );
      } else if (error.status === 401) {
        setSaveErrors(['認証の有効期限が切れました。再度ログインしてください。']);
      } else {
        setSaveErrors(['保存に失敗しました。通信状況を確認して、もう一度お試しください。']);
      }
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return { isSaving, saveErrors, setSaveErrors, saveTravelPlan };
}
