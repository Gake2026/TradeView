import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and swallow cross-origin script errors and unhandled rejections from external third-party embeds
window.addEventListener('error', (event) => {
  // 'Script error.' occurs when an external script (CORS-restricted) throws an error
  if (event.message === 'Script error.' || !event.filename || event.filename.includes('tradingview')) {
    event.preventDefault();
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
