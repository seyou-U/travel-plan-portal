export function getErrorMessage(error, fallbackMessage) {
  const fieldErrors = error?.data?.errors;

  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstFieldMessage = Object.values(fieldErrors).find(
      (messages) => Array.isArray(messages) && messages.length > 0,
    );

    if (Array.isArray(firstFieldMessage) && firstFieldMessage[0]) {
      return firstFieldMessage[0];
    }
  }

  return error?.data?.message ?? fallbackMessage;
}
