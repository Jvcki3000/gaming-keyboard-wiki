import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import { CompareProvider } from './lib/CompareContext';
import './styles.css';

const isVercelHost = window.location.hostname.endsWith('vercel.app');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CompareProvider>
        <App />
        {isVercelHost ? <Analytics /> : null}
        {isVercelHost ? <SpeedInsights /> : null}
      </CompareProvider>
    </HashRouter>
  </React.StrictMode>,
);
