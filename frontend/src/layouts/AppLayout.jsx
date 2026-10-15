import { AppSideBar } from '../components/AppSideBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useState } from 'react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logout();
      navigate('/login', {
        replace: true,
        state: { logoutMessage: response?.message },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-slate-900 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <AppSideBar user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <main className="min-w-0 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
