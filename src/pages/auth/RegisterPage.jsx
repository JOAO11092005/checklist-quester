import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase/config'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { notify } from '../../utils/toast'; 

import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoArrowForward,
  IoShieldCheckmarkOutline,
  IoCodeSlashOutline
} from 'react-icons/io5';

import Logo from '../../assets/images/Logo'; // ✅ Importando a Logo Oficial
import './RegisterPage.css'; // ✅ Atualizado para o CSS correto

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      return notify.error('Protocolo de segurança: As senhas não coincidem.');
    }

    if (password.length < 6) {
        return notify.info('A senha deve conter no mínimo 6 caracteres.');
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        photoURL: "",
        role: "Estudante",
        createdAt: serverTimestamp(),
        status: "Pending" 
      });

      await setDoc(doc(db, "progress", user.uid), {
        lessons: {},
        xp: 0,
        streak: 0,
        lastLogin: serverTimestamp()
      });

      notify.success(`Identidade criada com sucesso.`);
      navigate('/request-invite');

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        notify.error('Este e-mail já possui um registro no banco de dados.');
      } else {
        notify.error('Falha na criação do registro. Verifique a conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-master-wrapper">
      
      {/* --- LADO ESQUERDO: PAINEL VISUAL --- */}
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
            Acesso restrito à arquitetura de ensino avançada. Forneça seus dados 
            para requisitar uma credencial de acesso ao ecossistema.
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <IoCodeSlashOutline className="f-icon"/>
              <span>Engenharia de Software</span>
            </div>
            <div className="feature-item">
              <IoShieldCheckmarkOutline className="f-icon"/>
              <span>Autenticação Blindada</span>
            </div>
          </div>
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
               <IoPersonOutline /> 
            </div>
            <h2>Nova Identidade</h2>
            <p>Preencha os parâmetros para gerar sua conta.</p>
          </header>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="tech-input-group">
              <label>Identificação de Operador (Nome)</label>
              <div className="input-wrapper">
                <IoPersonOutline className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Ex: J. Anderson"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="tech-input-group">
              <label>Endereço de Comunicação (E-mail)</label>
              <div className="input-wrapper">
                <IoMailOutline className="input-icon" />
                <input 
                  type="email" 
                  placeholder="operador@dominio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row-split">
              <div className="tech-input-group">
                <label>Chave Segurança</label>
                <div className="input-wrapper">
                  <IoLockClosedOutline className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="tech-input-group">
                <label>Confirmar Chave</label>
                <div className="input-wrapper">
                  <IoLockClosedOutline className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="login-button-tech" disabled={loading}>
              {loading ? (
                <span>PROCESSANDO...</span>
              ) : (
                <>GERAR CONTA <IoArrowForward /></>
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <p>Já possui registro no sistema? <Link to="/">Iniciar Sessão</Link></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;