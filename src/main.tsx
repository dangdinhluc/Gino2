import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mock-ux.css';
import { registerServiceWorker } from '@/src/features/notifications/repositories/pushRepository';

if ('serviceWorker' in navigator) {
  void registerServiceWorker();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
