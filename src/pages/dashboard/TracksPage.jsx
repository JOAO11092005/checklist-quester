import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft, Code2, Hammer } from 'lucide-react';
import './TracksPage.css';

const TracksPage = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        
        {/* Ícone Animado */}
        <div className="icon-wrapper">
          <div className="icon-circle">
            <Construction size={48} className="main-icon" />
          </div>
          <div className="orbit-icon icon-1"><Code2 size={20} /></div>
          <div className="orbit-icon icon-2"><Hammer size={20} /></div>
        </div>

        {/* Textos Principais */}
        <h1 className="maintenance-title">Em Desenvolvimento</h1>
        
        <p className="maintenance-description">
          Estamos refatorando o sistema de Trilhas para trazer uma experiência 
          de aprendizado mais fluida e atualizada.
        </p>

        <div className="status-box">
          <div className="status-item">
            <span className="dot yellow"></span>
            <span>Código em manutenção</span>
          </div>
          <div className="status-item">
            <span className="dot blue"></span>
            <span>Novas features em breve</span>
          </div>
        </div>

        {/* Botão de Ação */}
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} />
          Voltar para o Início
        </Link>
      </div>

      {/* Background Decorativo */}
      <div className="bg-blur-1"></div>
      <div className="bg-blur-2"></div>
    </div>
  );
};

export default TracksPage;