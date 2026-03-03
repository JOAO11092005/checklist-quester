// src/components/layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Importante!
import Header from './Header'; // Vamos assumir que você tem ou criará um Header
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Header /> {/* O seu cabeçalho roxo que aparece em todas as telas */}
      <main className="dashboard-content">
        {/* O Outlet é onde as páginas (HomePage, CourseDetailPage) serão renderizadas */}
        <Outlet />
      </main>
    </div>
  );
};

// --- Componente Header Simples (pode ficar no mesmo arquivo ou separado) ---
const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="logo">DEVQUEST</div>
      <nav>
        {/* Adicione seus links de navegação aqui */}
      </nav>
      <div className="user-profile">
        {/* Ícones de usuário, etc. */}
      </div>
    </header>
  );
};


export default DashboardLayout;