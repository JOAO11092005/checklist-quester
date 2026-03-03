import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import { 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoArrowForward, 
  IoHardwareChipOutline,
  IoFingerPrintOutline,
  IoLayersOutline,
  IoPulseOutline
} from 'react-icons/io5';

import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Vídeo de fundo com qualidade high-end
  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Autenticação confirmada.');
      navigate('/home'); 
    } catch (err) {
      console.error(err);
      toast.error('Acesso negado. Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-master-wrapper">

      <div className="login-visual-panel">
        <div className="video-viewport">
          <video autoPlay loop muted playsInline className="main-video">
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="video-vignette"></div>
        </div>

        <div className="visual-overlay-text">
          <div className="system-badge">
            
          </div>

          <h1 className="tech-title">
            Curses Telegran
          </h1>

          <p className="typing-effect">
            A plataforma definitiva de engenharia de software. Conteúdo estruturado, 
            telemetria de aprendizado e o caminho mais eficiente para a senioridade.
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <IoLayersOutline className="f-icon"/>
              <span>Rotas Modulares</span>
            </div>
            <div className="feature-item">
              <IoPulseOutline className="f-icon"/>
              <span>Stack Operacional</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="glass-form-container">
          <header className="form-header">
            <div className="auth-icon-wrapper">
              <IoFingerPrintOutline />
            </div>
            <h2>Acesso Restrito</h2>
            <p>Forneça suas credenciais para estabelecer a conexão.</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="tech-input-group">
              <label>Credencial (E-mail)</label>
              <div className="input-wrapper">
                <IoMailOutline className="input-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="usuario@dominio.com" 
                  required
                />
              </div>
            </div>

            <div className="tech-input-group">
              <label>Chave de Acesso (Senha)</label>
              <div className="input-wrapper">
                <IoLockClosedOutline className="input-icon" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  required
                />
              </div>
            </div>

            <div className="auth-options">
              <label className="tech-checkbox">
                <input type="checkbox" />
                <span className="check-custom"></span>
                Manter conexão ativa
              </label>
              <Link to="/forgot-password" className="recover-link">Recuperar chave</Link>
            </div>

            <button type="submit" className="login-button-tech" disabled={loading}>
              {loading ? (
                <span>PROCESSANDO...</span>
              ) : (
                <>
                  INICIAR SESSÃO <IoArrowForward />
                </>
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <p>Requisitar ingresso no sistema? <Link to="/register">Solicitar Convite</Link></p>
          </footer>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;