import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Feature flag for safe mode
declare global {
  interface Window {
    BRIEFS_DETAIL_SAFE_MODE: boolean;
  }
}

window.BRIEFS_DETAIL_SAFE_MODE = true;

// Global error handlers to catch unhandled errors
window.addEventListener('error', e => console.error('GlobalError', e?.error || e));
window.addEventListener('unhandledrejection', e => console.error('GlobalPromiseRejection', e?.reason || e));

createRoot(document.getElementById("root")!).render(<App />);
