import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function RequireAuth({ children }) {
  const { user, booting } = useAuth();

  if (booting) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export function RedirectIfAuthed({ children }) {
  const { user, booting } = useAuth();

  if (booting) return null;
  if (user) return <Navigate to="/top" replace />;

  return children;
}

export function RootRedirect() {
  const { user, booting } = useAuth();

  if (booting) return null;
  return <Navigate to={user ? '/top' : '/login'} replace />;
}
