import './index.css';
import { createRoot } from 'react-dom/client';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { TravelPlanDraftProvider } from './contexts/TravelPlanDraftContext';
import { AiPlanProvider } from './contexts/AiPlanContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TravelPlanDraftProvider>
        <AiPlanProvider>
          <RouterProvider router={router} />
        </AiPlanProvider>
      </TravelPlanDraftProvider>
    </AuthProvider>
  </StrictMode>,
);
