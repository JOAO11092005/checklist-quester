import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { 
  IoShieldHalfOutline, 
  IoPaperPlaneOutline, 
  IoTimeOutline,
  IoLogOutOutline
} from 'react-icons/io5';
import { signOut } from 'firebase/auth';

import './LoginPage.css'; // Usando o mesmo CSS para manter o design padrão

const RequestInvitePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Pending'); // Pode ser 'Pending', 'Requested' ou 'Active'

  const videoUrl = "https://canvaz.scdn.co/upload/artist/3gi5McAv9c0qTjJ5jSmbL0/video/960374af57804d6f96f3c86233c90983.cnvs.mp4";

  useEffect(() => {
    // Busca o status atual do usuário assim que a página carrega
    const checkUserStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStatus(userData.status);
          
          // Se o admin já tiver aprovado, manda ele pro dashboard
          if (userData.status === 'Active') {
            navigate('/dashboard'); // ou '/home'
          }
        }
      } else {
        navigate('/'); // Se não estiver logado, manda pro login
      }
    };
    
    checkUserStatus();
  }, [navigate]);

  const handleRequestInvite = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Atualiza o status no banco de dados para "Requested"
        await updateDoc(doc(db, "users", user.uid), {
          status: "Requested"
        });
        setStatus("Requested");
        toast.success("Solicitação enviada! Aguarde a aprovação do Administrador.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
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
            <IoShieldHalfOutline /> PROTOCOLO DE SEGURANÇA
          </div>
          <h1 className="tech-title">SISTEMA FECHADO</h1>
          <p className="typing-effect">
            Sua identidade foi criada, mas este é um ambiente de acesso restrito. 
            É necessário passar pela verificação da administração central para obter autorização total.
          </p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="glass-form-container" style={{ textAlign: 'center' }}>
          <header className="form-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="auth-icon-wrapper" style={{ width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '50%' }}>
               {status === 'Requested' ? <IoTimeOutline /> : <IoShieldHalfOutline />}
            </div>
            <h2>{status === 'Requested' ? 'EM ANÁLISE' : 'ÁREA RESTRITA'}</h2>
            <p>
              {status === 'Requested' 
                ? 'Sua solicitação está na mesa do Administrador. Você será notificado ou poderá tentar login mais tarde.'
                : 'Clique no botão abaixo para enviar sua solicitação de acesso ao Administrador do sistema.'}
            </p>
          </header>

          {status === 'Pending' && (
            <button 
              className="login-button-tech" 
              onClick={handleRequestInvite} 
              disabled={loading}
              style={{ padding: '20px', fontSize: '1.1rem' }}
            >
              {loading ? 'TRANSMITINDO...' : <><IoPaperPlaneOutline /> SOLICITAR CONVITE DE ACESSO</>}
            </button>
          )}

          {status === 'Requested' && (
            <div style={{
              padding: '20px', 
              border: '1px solid var(--border-subtle)', 
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-main)',
              letterSpacing: '1px',
              fontWeight: '500'
            }}>
              STATUS: AGUARDANDO LIBERAÇÃO
            </div>
          )}

          <footer className="auth-footer" style={{ marginTop: '50px' }}>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
            >
              <IoLogOutOutline /> Encerrar Sessão e Sair
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RequestInvitePage;