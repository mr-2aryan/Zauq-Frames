import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/global.css';
import { initMotion } from '@/utils/motion';

// Before the first render, so every image and revealed element is caught.
initMotion();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
