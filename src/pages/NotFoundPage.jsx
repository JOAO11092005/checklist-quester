import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoPlanetOutline, IoWarningOutline } from 'react-icons/io5';
import './Pagina404.css'; // Certifique-se que o nome do arquivo CSS corresponde

const NotFoundPage = () => {
  return (
    <div className="not-found-wrapper">
      {/* Background Elements */}
      <div className="nf-glow-spot top-left"></div>
      <div className="nf-glow-spot bottom-right"></div>
      <div className="grid-overlay"></div>

      <div className="nf-content-glass">
        <div className="glitch-container">
          <h1 className="nf-code" data-text="404">404</h1>
        </div>
        
        <div className="nf-message-box">
          <div className="icon-badge">
            <IoPlanetOutline className="nf-icon spin-slow" />
          </div>
          
          <h2 className="nf-title">Sistema Interrompido</h2>
          <p className="nf-description">
            A página que procuras perdeu-se no hiperespaço ou nunca existiu.
            <br />Verifica o URL ou regressa à base.
          </p>

          <Link to="/home" className="nf-btn-home">
            <IoArrowBack /> Regressar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;