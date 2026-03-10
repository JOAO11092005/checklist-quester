import React, { useState, useEffect } from 'react';
import { Rocket, Globe, X } from 'lucide-react';
import './DomainBanner.css';

export default function DomainBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Pega o domínio atual que está no navegador do usuário
    const currentDomain = window.location.hostname;
    const vercelDomain = 'webfullstack-three.vercel.app';
    
    // Verifica se o usuário já escolheu fechar este aviso na sessão atual
    const hasDismissed = sessionStorage.getItem('dismissDomainBanner');

    // Se a URL for a da Vercel e o banner não foi fechado, mostra na tela
    if (currentDomain === vercelDomain && !hasDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleGoToOriginal = () => {
    // Faz a "dobra espacial" para o servidor original
    window.location.href = 'https://academyx.libraryfinamce.workers.dev/';
  };

  const handleStayHere = () => {
    // Salva no navegador para o banner não reaparecer até ele fechar a aba
    sessionStorage.setItem('dismissDomainBanner', 'true');
    setShowBanner(false);
  };

  // Se não for para mostrar, retorna vazio (não renderiza nada)
  if (!showBanner) return null;

  return (
    <div className="space-banner">
      <div className="space-banner-content">
        
        <div className="space-glow-text">
          <Globe size={22} className="pulse-icon" />
          <span>Você está em uma rota de acesso alternativa.</span>
        </div>
        
        <div className="space-actions">
          <button onClick={handleStayHere} className="btn-stay">
            Continuar Aqui
          </button>
          
          <button onClick={handleGoToOriginal} className="btn-warp">
            <Rocket size={18} />
            Ir para Domínio Original
          </button>
          
          <button onClick={handleStayHere} className="btn-close" aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}