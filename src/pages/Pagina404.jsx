// src/pages/Pagina404.jsx
import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { IoWarningOutline, IoTerminalOutline } from 'react-icons/io5';
import 'Pagina404.css'
function Pagina404() {
  const error = useRouteError();
  console.error("Critical System Error:", error);

  return (
    <main id="star-404-portal" className="star-404-wrapper">
      {/* CSS INTERNO INJETADO DIRETAMENTE */}
      <style>{`
        #star-404-portal.star-404-wrapper {
          --star-bg: #000000;
          --star-accent: #ffffff;
          --star-border: #333333;
          --star-text-muted: #888888;
          
          min-height: 100vh;
          width: 100vw;
          background-color: var(--star-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0; left: 0;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          color: white;
        }

        /* Efeito de Grade de Radar */
        #star-404-portal .star-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.3;
          z-index: 0;
        }

        .star-404-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 600px;
          padding: 20px;
          width: 100%;
        }

        /* GLITCH 404 */
        .star-404-code {
          font-size: clamp(6rem, 15vw, 10rem);
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
          color: var(--star-accent);
          letter-spacing: -5px;
          position: relative;
          margin: 0 0 20px 0;
          line-height: 1;
        }

        .star-404-code::before,
        .star-404-code::after {
          content: "404";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: var(--star-bg);
        }

        .star-404-code::before {
          left: 3px;
          text-shadow: -2px 0 #555;
          clip: rect(24px, 550px, 90px, 0);
          animation: star-glitch-1 3s infinite linear alternate-reverse;
        }

        .star-404-code::after {
          left: -3px;
          text-shadow: -2px 0 #aaa;
          clip: rect(85px, 550px, 140px, 0);
          animation: star-glitch-2 2.5s infinite linear alternate-reverse;
        }

        /* Mensagem e Box */
        .star-404-card {
          background: #0a0a0a;
          border: 1px solid var(--star-border);
          padding: 40px;
          border-radius: 2px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        }

        .star-404-title {
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }

        .star-404-desc {
          color: var(--star-text-muted);
          line-height: 1.6;
          margin-bottom: 30px;
        }

        /* Botão */
        .star-404-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: white;
          color: black;
          text-decoration: none;
          padding: 16px 32px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.3s;
        }

        .star-404-btn:hover {
          background: transparent;
          color: white;
          box-shadow: inset 0 0 0 1px white;
        }

        @keyframes star-glitch-1 {
          0% { clip: rect(10px, 9999px, 30px, 0); }
          100% { clip: rect(40px, 9999px, 60px, 0); }
        }
        @keyframes star-glitch-2 {
          0% { clip: rect(70px, 9999px, 90px, 0); }
          100% { clip: rect(10px, 9999px, 25px, 0); }
        }
      `}</style>

      <div className="star-bg-grid"></div>

      <div className="star-404-content">
        <h1 className="star-404-code">404</h1>

        <div className="star-404-card">
          <div style={{ marginBottom: '20px', color: '#888' }}>
            <IoWarningOutline size={40} />
          </div>
          
          <h2 className="star-404-title">Perda de Sinal</h2>
          <p className="star-404-desc">
            As coordenadas solicitadas não correspondem a um diretório ativo. 
            O acesso a este setor foi interrompido.
          </p>

          <div style={{ 
            background: '#000', 
            padding: '10px', 
            fontFamily: 'monospace', 
            fontSize: '0.75rem', 
            color: '#555',
            textAlign: 'left',
            marginBottom: '30px',
            border: '1px dashed #222'
          }}>
            sys.err_log: {error?.statusText || error?.message || "ROUTE_NOT_FOUND"}
          </div>

          <Link to="/" className="star-404-btn">
            <IoTerminalOutline /> Retornar à Base
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Pagina404;