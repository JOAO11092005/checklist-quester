import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaGithub, FaLinkedin, FaDiscord, FaHeart } from 'react-icons/fa'; 
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
        console.error("Erro ao verificar credenciais:", error);
        setHasAccessKey(false);
      }
    };
    checkAccessKey();
  }, [currentUser]);

  return (
    <footer className="main-footer-tech">
      <div className="footer-content">
        
        {/* Seção da Esquerda: Copyright e Marca */}
        <div className="footer-info">
          {hasAccessKey ? (
            <p>
              COPYRIGHT © {currentYear} <span className="highlight-tech">DEVSTREAM SYSTEMS</span>.
              <br className="mobile-break" /> TODOS OS DIREITOS RESERVADOS.
            </p>
          ) : (
            <p>
              COPYRIGHT © {currentYear} <span className="highlight-tech">DEV EM DOBRO</span>.
              <br className="mobile-break" /> TODOS OS DIREITOS RESERVADOS.
            </p>
          )}
          
          {hasAccessKey && (
             <p className="powered-by">
               CODIFICADO COM <FaHeart size={12} color="#ffffff" style={{ margin: '0 5px' }} /> POR VOCÊ
             </p>
          )}
        </div>

        {/* Seção da Direita: Links e Redes */}
        <div className="footer-links-container">
          {hasAccessKey && (
            <div className="social-icons-tech">
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
          
          <nav className="footer-nav-tech">
            <a href="/termos">DIRETRIZES DE USO</a>
            <a href="/privacidade">POLÍTICA DE PRIVACIDADE</a>
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer;