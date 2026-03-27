import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import {
  fetchMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from '../features/auth/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchMe();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async (values) => {
    const user = await loginApi(values);
    setUser(user);
    return user;
  };

  const register = async (values) => {
    const user = await registerApi(values);
    setUser(user);
    return user;
  };

  const logout = async () => {
    const response = await logoutApi();
    sessionStorage.setItem('logoutMessage', response?.message);
    setUser(null);
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
