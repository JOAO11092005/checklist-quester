import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaGithub, FaLinkedin, FaDiscord, FaHeart } from 'react-icons/fa'; // Adicionei o coração para o "Powered by"
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { currentUser } = useAuth();
  const [hasAccessKey, setHasAccessKey] = useState(false);

  useEffect(() => {
    const checkAccessKey = async () => {
      if (!currentUser) {
        setHasAccessKey(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().accessKey === 'curso2025') {
          setHasAccessKey(true);
        } else {
          setHasAccessKey(false);
        }
      } catch (error) {
        console.error("Erro ao verificar a chave de acesso:", error);
        setHasAccessKey(false);
      }
    };
    checkAccessKey();
  }, [currentUser]);

  return (
    <footer className="main-footer">
      <div className="footer-content">
        
        {/* Seção da Esquerda: Copyright e Marca */}
        <div className="footer-info">
          {hasAccessKey ? (
            <p>
              Copyright © {currentYear} <span className="highlight">Desenvolvimento Web</span>.
              <br className="mobile-break" /> Todos os direitos reservados.
            </p>
          ) : (
            <p>
              Copyright © {currentYear} <span className="highlight">Dev em Dobro</span>.
              <br className="mobile-break" /> Todos os direitos reservados.
            </p>
          )}
          
          {hasAccessKey && (
             <p className="powered-by">
               Code with <FaHeart size={12} color="blueviolet" /> by You
             </p>
          )}
        </div>

        {/* Seção da Direita: Links e Redes */}
        <div className="footer-links-container">
          {hasAccessKey && (
            <div className="social-icons">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord />
              </a>
            </div>
          )}
          
          <nav className="footer-nav">
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer;