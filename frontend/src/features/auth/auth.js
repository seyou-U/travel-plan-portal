import { apiFetch, setupCsrfCookie } from '../../lib/api';

export async function register({ name, email, password, password_confirmation }) {
  try {
    await apiFetch('/api/register', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        password_confirmation,
      },
    });
    const user = await apiFetch('/api/me');
    return user;
  } catch (e) {
    console.error('新規登録に失敗しました:', e);
    throw e;
  }
}

export async function login({ email, password }) {
  try {
    await apiFetch('/api/login', { method: 'POST', body: { email, password } });
    const user = await apiFetch('/api/me');
    return user;
  } catch (e) {
    console.error('ログインに失敗しました:', e);
    throw e;
  }
}

export async function logout() {
  try {
    return await apiFetch('/api/logout', { method: 'POST' });
  } catch (e) {
    // 未認証状態でログアウトしようとした場合は無視する
    if (e.status === 401) return null;

    // CSRFトークン未取得もしくは不正の場合
    if (e.status === 419) {
      await setupCsrfCookie();
      return apiFetch('/api/logout', { method: 'POST' });
    }
    throw e;
  }
}

export async function fetchMe() {
  return apiFetch('/api/me');
}
