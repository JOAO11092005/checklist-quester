// src/pages/Ajuda.js (ou onde preferir)

import React from 'react';
import { FaShieldAlt } from 'react-icons/fa'; // Ícone para dar um toque visual
import './Ajuda.css'; // Vamos criar este arquivo de estilo a seguir

const Ajuda = () => {
  const adblockUrl = "https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg";

  return (
    <div className="ajuda-container">
      <div className="ajuda-card">
        <div className="card-header">
          <FaShieldAlt size={40} className="header-icon" />
          <h1>Melhore sua experiência na plataforma</h1>
        </div>
        <p className="card-intro">
          Nossa plataforma utiliza um player de vídeo externo e gratuito para as aulas. Para garantir que você assista ao conteúdo sem interrupções de anúncios, recomendamos <strong>fortemente</strong> a instalação de um bloqueador.
        </p>

        <div className="steps-container">
          <h2>Passo a passo (leva 30 segundos)</h2>
          <ol className="steps-list">
            <li>Clique no botão abaixo para ir à página da extensão na Chrome Store.</li>
            <li>Na página que abrir, clique em <strong>"Usar no Chrome"</strong> ou <strong>"Adicionar ao Chrome"</strong>.</li>
            <li>Confirme a instalação na janela que aparecer e pronto! ✨</li>
          </ol>
        </div>

        <a 
          href={adblockUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="adblock-button"
        >
          Instalar AdBlocker Gratuito
        </a>
      </div>
    </div>
  );
};

export default Ajuda;