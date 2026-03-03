import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { 
  IoMailOutline, 
  IoArrowBack, 
  IoKeyOutline, 
  IoInformationCircleOutline 
} from 'react-icons/io5';

import './LoginPage.css'; // Reutiliza os estilos que já criamos para consistência

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // URL do mesmo vídeo da Login para manter o padrão de marca
  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Protocolo enviado! Verifique seu terminal (e-mail).');
      setEmail(''); 
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        toast.error('Operador não identificado na rede.');
      } else {
        toast.error('Erro na transmissão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-master-wrapper">
      
      {/* Efeito de Partículas em background */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => <div key={i} className="particle"></div>)}
      </div>

      <div className="login-content-box">
        
        {/* Lado Esquerdo: Imersão Visual */}
        <div className="login-visual-panel">
          <div className="video-viewport">
            <video autoPlay loop muted playsInline className="main-video">
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="video-scanline"></div>
            <div className="video-vignette"></div>
          </div>
          
          <div className="visual-overlay-text">
            <div className="system-badge">
              <IoKeyOutline /> RECOVERY PROTOCOL
            </div>
            <h1 className="glitch-title" data-text="RECOVERY">RECOVERY</h1>
            <p className="typing-effect">Não se preocupe, até os melhores arquitetos perdem suas chaves.</p>
          </div>
        </div>

        {/* Lado Direito: Formulário de Redefinição */}
        <div className="login-form-panel">
          <div className="glass-form-container">
            <header className="form-header">
              <div className="auth-icon">
                <IoKeyOutline />
              </div>
              <h2>Recuperar Chave</h2>
              <p>Enviaremos um link de descriptografia para o seu e-mail.</p>
            </header>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="cyber-input-group">
                <label>E-MAIL DE REGISTRO</label>
                <div className="input-wrapper">
                  <IoMailOutline className="input-icon" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="operador@sistema.com" 
                    required
                  />
                </div>
              </div>

              <div className="info-box-recovery">
                <IoInformationCircleOutline size={20} />
                <p>Verifique a pasta de spam caso o link não chegue em 2 minutos.</p>
              </div>

              <button type="submit" className="login-button-cyber" disabled={loading}>
                {loading ? (
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                ) : (
                  <>
                    ENVIAR PROTOCOLO
                  </>
                )}
              </button>
            </form>

            <footer className="auth-footer">
              <Link to="/home" className="back-to-login">
                <IoArrowBack /> Voltar para Autenticação
              </Link>
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;