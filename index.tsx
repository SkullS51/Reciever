
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; 
import ErrorBoundary from './components/ErrorBoundary';
import { safeStringify } from './services/utils';

// AZRAEL // GLOBAL_STABILITY_PROTOCOL
window.onerror = (message, source, lineno, colno, error) => {
  console.error("AZRAEL_GLOBAL_CRASH_INTERCEPTED:", safeStringify({
    message, source, lineno, colno, error
  }));
  return false; // Let it propagate to ErrorBoundary if possible
};

window.onunhandledrejection = (event) => {
  console.error("AZRAEL_UNHANDLED_REJECTION_INTERCEPTED:", safeStringify({
    reason: event.reason
  }));
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
