import React from 'react';

const Logo = ({ 
  className = "logo-spacex", 
  color = "#FFFFFF", 
  accentColor = "white" 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 320 60" 
      className={className}
      style={{ display: 'block', width: 'auto', height: '100%' }}
    >
      <defs>
        {/* Efeito de brilho sutil opcional para o X */}
        <filter id="glowX">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* --- TEXTO: ACADEMY --- */}
      <text 
        x="0"
        y="45"
        style={{ 
          fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace", 
          fontWeight: '900', 
          fontSize: '46px', 
          letterSpacing: '-1.5px',
          fill: color,
          textTransform: 'uppercase'
        }}
      >
        ACADEMY
      </text>

      {/* --- O "X" EXATO (Estilo Twitter/X) --- */}
      {/* Posicionado logo ao lado da palavra ACADEMY */}
      <g transform="translate(205, 7) scale(1.7)">
        {/* Este 'path' desenha o X exatamente igual à sua imagem de referência */}
        <path 
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" 
          fill={accentColor} 
          filter=""
        />
      </g>
    </svg>
  );
};

export default Logo;