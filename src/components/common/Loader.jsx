import React from 'react';
import './Loader.css';

const Loader = ({ title = "SINC_SISTEMA_STARLINK", isExiting = false }) => {
    return (
        <div className={`star-load-overlay ${isExiting ? 'is-exiting' : ''}`}>
            
            {/* Efeito de Scanline de Radar */}
            <div className="star-load-radar"></div>

            <div className="star-load-content">
                {/* Scanner de Hardware (Substitui as barras neon) */}
                <div className="star-load-scanner">
                    <div className="star-load-bar"></div>
                    <div className="star-load-bar"></div>
                    <div className="star-load-bar"></div>
                    <div className="star-load-bar"></div>
                    <div className="star-load-bar"></div>
                </div>
                
                <h1 className="star-load-text">
                    {title.split('').map((char, index) => (
                        <span 
                            key={index} 
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </h1>

                {/* Status de Telemetria inferior */}
                <div className="star-load-subtext">
                    <span>ESTADO: OTIMIZANDO_NODES</span>
                    <span className="star-load-blink">_</span>
                </div>
            </div>
        </div>
    );
};

export default Loader;