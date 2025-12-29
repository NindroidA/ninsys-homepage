import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Pages from './pages/index.tsx';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Pages />
    </AuthProvider>
  </React.StrictMode>,
);