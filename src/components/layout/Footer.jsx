import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaGithub, FaLinkedin, FaDiscord, FaHeart } from 'react-icons/fa'; 
// Importe a logo. Ajuste o caminho se necessário (ex: '../../assets/Logo' ou '../../assets/images/Logo')
import Logo from '../../assets/images/Logo'; 
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
        
        {/* Seção da Esquerda: Logo, Copyright e Marca */}
        <div className="footer-info">
          
          {/* A LOGO PEQUENA NO CANTO */}
          <div className="footer-logo-wrapper">
            {/* Passamos uma cor cinza para ficar discreta no rodapé */}
            <Logo className="footer-logo-svg" color="#666666" accentColor="white" />
          </div>

          {hasAccessKey ? (
            <p>
              COPYRIGHT © {currentYear} <span className="highlight-tech">ACADEMY-X</span>.
              <br className="mobile-break" /> TODOS OS DIREITOS RESERVADOS.
            </p>
          ) : (
            <p>
              COPYRIGHT © {currentYear} <span className="highlight-tech">ACADEMY-X PRO</span>.
              <br className="mobile-break" /> TODOS OS DIREITOS RESERVADOS.
            </p>
          )}
          
          {hasAccessKey && (
             <p className="powered-by">
             
             </p>
          )}
        </div>

        {/* Seção da Direita: Links e Redes */}
        <div className="footer-links-container">
          {hasAccessKey && (
            <div className="social-icons-tech">
              {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a> */}
              <a href="https://discord.com/channels/@me/892802267659505784" target="_blank" rel="noopener noreferrer" aria-label="Discord">
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