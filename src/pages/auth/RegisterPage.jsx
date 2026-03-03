import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase/config'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { toast } from 'react-toastify';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoKeyOutline, 
  IoArrowForward,
  IoHardwareChipOutline,
  IoShieldCheckmarkOutline,
  IoCodeSlashOutline
} from 'react-icons/io5';

// Mantendo o CSS unificado do estilo Starlink
import './LoginPage.css'; 

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // URL do vídeo de fundo (Mesmo do Login para transição suave)
  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accessKey: '', 
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, accessKey, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      return toast.error('Protocolo de segurança: As senhas não coincidem.');
    }

    if (password.length < 6) {
        return toast.warn('A chave de acesso deve conter no mínimo 6 caracteres.');
    }

    setLoading(true);
    try {
      // 1. Criar Usuário na Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Atualizar Perfil
      await updateProfile(user, { displayName: name });

      // 3. Salvar no Firestore (Users)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        photoURL: "",
        role: "Estudante",
        createdAt: serverTimestamp(),
        accessKey: accessKey || "Free_Tier",
        status: "Active"
      });

      // 4. Iniciar documento de progresso
      await setDoc(doc(db, "progress", user.uid), {
        lessons: {},
        xp: 0,
        streak: 0,
        lastLogin: serverTimestamp()
      });

      toast.success(`Identidade confirmada. Operador ${name} registrado.`);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já possui um registro no banco de dados.');
      } else {
        toast.error('Falha na criação do registro. Verifique a conexão e tente novamente.');
      }
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
            <IoHardwareChipOutline /> INICIALIZAÇÃO DE SISTEMA
          </div>

          <h1 className="tech-title">REGISTRO DE OPERADOR</h1>

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

      <div className="login-form-panel">
        <div className="glass-form-container">
          <header className="form-header">
            <div className="auth-icon-wrapper">
               <IoPersonOutline /> 
            </div>
            <h2>Nova Identidade</h2>
            <p>Preencha os parâmetros para gerar sua credencial.</p>
          </header>

          <form onSubmit={handleRegister} className="auth-form">

            {/* Nome */}
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

            {/* Email */}
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

            {/* Chave de Acesso */}
            <div className="tech-input-group">
              <label>Código de Convite (Opcional)</label>
              <div className="input-wrapper">
                <IoKeyOutline className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Insira a chave de autorização"
                  value={formData.accessKey}
                  onChange={(e) => setFormData({...formData, accessKey: e.target.value})}
                />
              </div>
            </div>

            {/* Senhas (Split Row) */}
            <div className="form-row-split">
              <div className="tech-input-group">
                <label>Chave de Acesso</label>
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
                <>GERAR CREDENCIAL <IoArrowForward /></>
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