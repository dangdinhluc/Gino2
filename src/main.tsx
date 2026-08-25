import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mock-ux.css';

if ('serviceWorker' in navigator) {
  const scope = import.meta.env.BASE_URL || '/';
  window.setTimeout(() => {
    void navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => undefined);
  }, 0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
