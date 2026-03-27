const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
let csrfPromise = null;
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

export function setupCsrfCookie({ force = false } = {}) {
  if (force) {
    csrfPromise = null;
  }

  // CSRF Cookie を取得するリクエストを1回だけ実行する。
  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CSRF cookie fetch failed: ${response.status}`);
        }
      })
      .catch((e) => {
        csrfPromise = null;
        throw e;
      });
  }
  return csrfPromise;
}

export async function apiFetch(path, { method = 'GET', body, _retried = false } = {}) {
  await setupCsrfCookie();

  const csrfToken = getCsrfTokenFromCookie();
  const headers = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const text = await response.text();
  let data = text ? safeJsonParse(text) : null;

  // トークン切れなどで 419 が返った場合は、CSRF Cookie を再取得して1回だけ再試行する。
  if (response.status === 419 && !_retried) {
    await setupCsrfCookie({ force: true });
    return apiFetch(path, { method, body, _retried: true });
  }

  if (!response.ok) {
    const error = new Error(data?.message ?? `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getCsrfTokenFromCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) return null;

  const value = cookie.slice(`${CSRF_COOKIE_NAME}=`.length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
