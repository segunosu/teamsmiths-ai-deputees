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

// Register service worker for PWA with update checking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[App] ServiceWorker registered:', registration.scope);
        
        // Check for updates on navigation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] New service worker found, installing...');
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[App] New service worker activated');
            }
          });
        });
        
        // Check for updates periodically
        setInterval(() => {
          console.log('[App] Checking for service worker updates...');
          registration.update();
        }, 60000); // Check every minute
        
        // Check for updates on page visibility change
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            console.log('[App] Page visible, checking for updates...');
            registration.update();
          }
        });
      })
      .catch(err => {
        console.error('[App] ServiceWorker registration failed:', err);
      });
  });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'SW_UPDATED') {
      console.log('[App] Service worker updated, reloading page...');
      window.location.reload();
    }
  });
  
  // Force check for updates on route changes
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          console.log('[App] Route changed, checking for updates...');
          reg.update();
        }
      });
    }
  }, 500);
}

createRoot(document.getElementById("root")!).render(<App />);
