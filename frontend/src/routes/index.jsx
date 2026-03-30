import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import PublicHomeLayout from '../layouts/PublicHomeLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MyPlanPage from '../pages/MyPlanPage';
import RegisterPage from '../pages/RegisterPage';
import SettingsPage from '../pages/SettingsPage';
import TopPage from '../pages/TopPage';
import { RedirectIfAuthed, RequireAuth } from './auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <PublicHomeLayout />,
        children: [{ index: true, element: <HomePage /> }],
      },
      {
        element: (
          <RedirectIfAuthed>
            <AuthLayout />
          </RedirectIfAuthed>
        ),
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        path: 'top',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [{ index: true, element: <TopPage /> }],
      },
      {
        path: 'me',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [{ index: true, element: <MyPlanPage /> }],
      },
      {
        path: 'plan',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [{ index: true, element: <MyPlanPage /> }],
      },
      {
        path: 'settings',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [{ index: true, element: <SettingsPage /> }],
      },
    ],
  },
]);

export default router;
