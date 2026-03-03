import React from 'react';
import './Loader.css';

// Aceita uma prop 'isExiting' para controlar a animação de saída
const Loader = ({ title = "INICIALIZANDO SISTEMA", isExiting = false }) => {
    return (
        // Adiciona a classe 'is-exiting' se a prop for verdadeira
        <div className={`loader-overlay-premium ${isExiting ? 'is-exiting' : ''}`}>
            
            <div className="loader-scanline"></div>

            <div className="loader-content">
                <div className="glitch-bars">
                    <div className="bar-neon"></div>
                    <div className="bar-neon"></div>
                    <div className="bar-neon"></div>
                    <div className="bar-neon"></div>
                    <div className="bar-neon"></div>
                </div>
                
                <h1 className="loader-text-modern">
                    {title.split('').map((char, index) => (
                        <span 
                            key={index} 
                            style={{ animationDelay: `${0.2 + index * 0.08}s` }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default Loader;