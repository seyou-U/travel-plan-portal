import './index.css';
import { createRoot } from 'react-dom/client';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { TravelPlanDraftProvider } from './contexts/TravelPlanDraftContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TravelPlanDraftProvider>
        <RouterProvider router={router} />
      </TravelPlanDraftProvider>
    </AuthProvider>
  </StrictMode>,
);
