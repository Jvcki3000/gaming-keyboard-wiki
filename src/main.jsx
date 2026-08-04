import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { CompareProvider } from './lib/CompareContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CompareProvider>
        <App />
      </CompareProvider>
    </HashRouter>
  </React.StrictMode>,
);
