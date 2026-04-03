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

const isProductionBuild = import.meta.env.PROD;

const clearServiceWorkerState = async () => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    console.info('[App] Cleared service workers and caches for development preview');
  } catch (error) {
    console.error('[App] Failed clearing service worker state:', error);
  }
};

const registerServiceWorker = () => {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[App] ServiceWorker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] New service worker found, installing...');

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[App] New service worker activated');
            }
          });
        });

        setInterval(() => {
          console.log('[App] Checking for service worker updates...');
          registration.update();
        }, 60000);

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

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'SW_UPDATED') {
      console.log('[App] Service worker updated, reloading page...');
      window.location.reload();
    }
  });
};

if ('serviceWorker' in navigator) {
  if (isProductionBuild) {
    registerServiceWorker();
  } else {
    void clearServiceWorkerState();
  }
}

createRoot(document.getElementById("root")!).render(<App />);
