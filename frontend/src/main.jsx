import './index.css';
import { createRoot } from 'react-dom/client';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
