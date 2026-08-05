import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { CompareProvider } from './lib/CompareContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CompareProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </CompareProvider>
    </HashRouter>
  </React.StrictMode>,
);
