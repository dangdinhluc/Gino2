import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerServiceWorker } from './features/notifications/repositories/pushRepository';
import App from './App.tsx';
import './index.css';
import './mock-ux.css';
import './shared/styles/lightweight-transitions.css';

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function scheduleServiceWorkerRegistration(): void {
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    void registerServiceWorker();
  };

  const schedule = () => {
    const idleWindow = window as IdleCapableWindow;
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(register, { timeout: 2_000 });
      return;
    }
    window.setTimeout(register, 750);
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}

scheduleServiceWorkerRegistration();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
