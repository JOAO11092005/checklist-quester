import React from 'react';
import { Link } from 'react-router-dom';
import { IoSettingsOutline, IoArrowBackOutline, IoTerminalOutline, IoHardwareChipOutline } from 'react-icons/io5';
import './TracksPage.css';

const TracksPage = () => {
  return (
    <div className="star-maint-container">
      <div className="star-maint-content">
        
        {/* Ícone de Engenharia de Sistemas */}
        <div className="star-maint-icon-wrapper">
          <div className="star-maint-icon-circle">
            <IoSettingsOutline size={48} className="star-maint-main-icon" />
          </div>
          <div className="star-maint-orbit icon-1"><IoTerminalOutline size={20} /></div>
          <div className="star-maint-orbit icon-2"><IoHardwareChipOutline size={20} /></div>
        </div>

        {/* Textos de Protocolo */}
        <h1 className="star-maint-title">UPGRADE DO SISTEMA</h1>
        
        <p className="star-maint-description">
          Estamos executando uma refatoração profunda no motor de trilhas para otimizar 
          a latência de aprendizado e a entrega de módulos dinâmicos.
        </p>

        <div className="star-maint-status-grid">
          <div className="star-maint-status-item">
            <span className="star-maint-dot dot-processing"></span>
            <span>RECOMPILANDO CORE</span>
          </div>
          <div className="star-maint-status-item">
            <span className="star-maint-dot dot-pending"></span>
            <span>AGUARDANDO DEPLOY</span>
          </div>
        </div>

        {/* Botão de Retorno à Base */}
        <Link to="/home" className="star-maint-back-btn">
          <IoArrowBackOutline size={20} />
          <span>RECONECTAR AO DASHBOARD</span>
        </Link>
      </div>

      {/* Luzes de Fundo Técnicas */}
      <div className="star-maint-blur-1"></div>
      <div className="star-maint-blur-2"></div>
    </div>
  );
};

export default TracksPage;