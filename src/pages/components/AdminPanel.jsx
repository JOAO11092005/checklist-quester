import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  IoServerOutline, IoRocketOutline, IoCubeOutline, 
  IoVideocamOutline, IoSpeedometerOutline, IoPeopleOutline
} from 'react-icons/io5';

// Importação dos Componentes Separados
import AdminDashboard from './AdminDashboard';
import AdminTrilhas from './AdminTrilhas';
import AdminModulos from './AdminModulos';
import AdminAulas from './AdminAulas';
import AdminUsers from './AdminUsers';

import './AdminPanel.css';

const ADMIN_EMAILS = [
  "joao@gmail.com",
  "joaopaulonevesbatista@gmail.com",
  "joaopaulonevesbatista20@gmail.com"
];

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Segurança: Se não estiver logado ou não for admin, chuta pra fora
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>DEV COMMAND</h2>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <IoSpeedometerOutline /> Dashboard
          </button>
          <button className={activeTab === 'trilhas' ? 'active' : ''} onClick={() => setActiveTab('trilhas')}>
            <IoRocketOutline /> Trilhas
          </button>
          <button className={activeTab === 'modulos' ? 'active' : ''} onClick={() => setActiveTab('modulos')}>
            <IoCubeOutline /> Módulos
          </button>
          <button className={activeTab === 'aulas' ? 'active' : ''} onClick={() => setActiveTab('aulas')}>
            <IoVideocamOutline /> Transmissões
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <IoPeopleOutline /> Operadores
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <h1><IoServerOutline /> Sistema Administrativo</h1>
          <p>Operador Logado: <span className="admin-email">{currentUser.email}</span></p>
        </header>

        {/* Renderização Condicional Limpa e Modular */}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'trilhas' && <AdminTrilhas />}
        {activeTab === 'modulos' && <AdminModulos />}
        {activeTab === 'aulas' && <AdminAulas />}
        {activeTab === 'users' && <AdminUsers />}

      </main>
    </div>
  );
};

export default AdminPanel;