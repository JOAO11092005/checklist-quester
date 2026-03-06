import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase/config'; 
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { 
  IoSearch, 
  IoNotificationsOutline, 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoHeartOutline, 
  IoTrophyOutline,
  IoServerOutline,
  IoStatsChartOutline, // Ícone para Telemetria
  IoMapOutline,        // Ícone para Rotas
  IoChatbubblesOutline // Ícone para Comunicação
} from 'react-icons/io5';
import Logo from '../../assets/images/Logo'; // Importando sua logo Nexora Orbital
import userAvatarPlaceholder from '../../assets/images/user-avatar.png'; 
import './Header.css';

const ADMIN_EMAILS = [
  "joao@gmail.com",
  "joaopaulonevesbatista@gmail.com",
  "joaopaulonevesbatista20@gmail.com"
];

const Header = () => {
  const { currentUser } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const myDevEmail = currentUser?.email ? `${currentUser.email.split('@')[0].toLowerCase()}@devweb.com` : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!myDevEmail) return;
    const qUnread = query(
      collection(db, 'emails'), 
      where('to', '==', myDevEmail),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(qUnread, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    }, (error) => {
      console.error("Erro na estatisticas de notificações: ", error);
    });
    return () => unsubscribe();
  }, [myDevEmail]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Erro ao encerrar sessão", error);
    }
  };

  return (
    <header className="header-tech">
      <div className="header-content">

        {/* LADO ESQUERDO: LOGO ORBITAL NEXORA */}
        <div className="header-left">
          <Link to="/home" className="logo-container-link">
            <Logo className="logo-spacex" />
          </Link>

          {/* NAVEGAÇÃO DESKTOP (Escondida em Mobile via CSS) */}
          <nav className="desktop-nav">
            <NavLink to="/estatistica" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              TELEMETRIA
            </NavLink>
            <NavLink to="/trilhas" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              ROTAS
            </NavLink>
            <NavLink to="/duvidas" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              COMUNICAÇÃO
            </NavLink>
            
            {isAdmin && (
              <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} style={{ color: '#00d2ff', fontWeight: 'bold' }}>
                <IoServerOutline style={{ marginRight: '5px' }} /> ADMIN
              </NavLink>
            )}
          </nav>
        </div>

        {/* LADO DIREITO: AÇÕES E PERFIL */}
        <div className="header-right">

          <div className="action-icons">
            <NavLink to="/search" className="icon-link">
              <button className="icon-btn" title="Busca de Dados"><IoSearch /></button>
            </NavLink>
            <NavLink to="/notificacao" className="icon-link">
              <button className="icon-btn notification-btn" title="Alertas">
                <IoNotificationsOutline />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>
            </NavLink>
          </div>

          <div className="separator-vertical"></div>

          {currentUser ? (
            <div className="profile-wrapper" ref={profileDropdownRef}>
              <button 
                className={`profile-trigger ${isProfileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <img 
                  src={currentUser.photoURL || userAvatarPlaceholder} 
                  alt="Avatar" 
                  className="user-avatar" 
                />
                <span className="user-name-short">{currentUser.displayName?.split(' ')[0] || 'OP-01'}</span>
              </button>

              {/* DROPDOWN TÉCNICO (Mobile Adaptive) */}
              <div className={`dropdown-menu-tech ${isProfileDropdownOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                  <span className="user-full-name">{currentUser.displayName || 'OPERADOR'}</span>
                  <span className="user-email">{myDevEmail || currentUser.email}</span>
                </div>

                <div className="dropdown-divider" />

                {/* LINKS EXCLUSIVOS PARA MOBILE (Aparecem apenas via CSS) */}
                <div className="mobile-only-nav">
                  <Link to="/estatistica" className="dropdown-item">
                    <IoStatsChartOutline /> ESTATISTICAS
                  </Link>
                  <Link to="/trilhas" className="dropdown-item">
                    <IoMapOutline /> ROTAS
                  </Link>
                  <Link to="/duvidas" className="dropdown-item">
                    <IoChatbubblesOutline /> COMUNICAÇÃO
                  </Link>
                  <div className="dropdown-divider" />
                </div>

                {/* LINKS PADRÃO */}
                <Link to="/perfil" className="dropdown-item">
                  <IoPersonOutline /> DADOS DO OPERADOR
                </Link>
                <Link to="/ranking" className="dropdown-item">
                  <IoTrophyOutline /> CLASSIFICAÇÃO
                </Link>
                <Link to="/curtidas" className="dropdown-item">
                  <IoHeartOutline /> FAVORITOS
                </Link>

                {isAdmin && (
                  <>
                    <div className="dropdown-divider" />
                    <Link to="/admin" className="dropdown-item admin-highlight">
                      <IoServerOutline /> ADMIN PANEL
                    </Link>
                  </>
                )}

                <div className="dropdown-divider" />

                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <IoLogOutOutline /> ENCERRAR SESSÃO
                </button>
              </div>
            </div>
          ) : (
            <Link to="/" className="login-btn-tech">CONECTAR</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;