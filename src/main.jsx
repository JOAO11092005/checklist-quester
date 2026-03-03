// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// 1. Importe o AuthProvider que criamos
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. O AuthProvider envolve o App, disponibilizando o contexto para todos */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);