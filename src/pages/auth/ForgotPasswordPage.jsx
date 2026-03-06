import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { notify } from '../../utils/toast'; 

import { 
  IoMailOutline, 
  IoArrowBack, 
  IoKeyOutline, 
  IoInformationCircleOutline 
} from 'react-icons/io5';

import Logo from '../../assets/images/Logo'; // ✅ Importando a Logo
import './forgot.css'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      notify.success('Protocolo enviado! Verifique seu terminal (e-mail).');
      setEmail(''); 
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        notify.error('Operador não identificado na rede.');
      } else {
        notify.error('Erro na transmissão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-master-wrapper">
      
      <div className="login-content-box">
        
        {/* --- LADO ESQUERDO: VISUAL --- */}
        <div className="login-visual-panel">
          <div className="video-viewport">
            <video autoPlay loop muted playsInline className="main-video">
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="video-vignette"></div>
          </div>
          
          <div className="visual-overlay-text">
            {/* Logo Desktop */}
            <div className="login-logo-wrapper desktop-logo">
              <Logo />
            </div>

            <p className="typing-effect">
              Não se preocupe, até os melhores arquitetos perdem suas chaves de acesso.
            </p>
          </div>
        </div>

        {/* --- LADO DIREITO: FORMULÁRIO --- */}
        <div className="login-form-panel">
          <div className="glass-form-container">
            <header className="form-header">
              {/* Logo Mobile */}
              <div className="login-logo-wrapper mobile-logo">
                <Logo />
              </div>

              <div className="auth-icon-wrapper">
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
                  <>ENVIAR PROTOCOLO</>
                )}
              </button>
            </form>

            <footer className="auth-footer">
              <Link to="/" className="back-to-login">
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