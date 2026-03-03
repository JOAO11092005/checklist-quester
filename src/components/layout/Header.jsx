import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { 
  IoSearch, 
  IoNotificationsOutline, 
  IoMenu, 
  IoClose, 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoHeartOutline, 
  IoTrophyOutline 
} from 'react-icons/io5';
import userAvatarPlaceholder from '../../assets/images/user-avatar.png'; 
import './Header.css';

const Header = () => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (error) {
      console.error("Erro ao desconectar", error);
    }
  };

  return (
    <header className="header-tech">
      <div className="header-content">

        {/* Lado Esquerdo: Logo */}
        <div className="header-left">
          <Link to="/home" className="logo-brand">
           <img src="https://curseduca-app.s3.us-east-1.amazonaws.com/7df80179-8a9f-4c82-bc55-8acd1166a599/4b99c838.png" alt="DevQuest" className="logo" /> 
          </Link>

          {/* Navegação Desktop */}
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
          </nav>
        </div>

        {/* Lado Direito: Ações */}
        <div className="header-right">

          {/* Busca e Notificações */}
          <div className="action-icons">
            <NavLink to="/search">
              <button className="icon-btn" title="Buscar no Banco de Dados">
              <IoSearch />
            </button>
            </NavLink>
            <NavLink to="/notificacao">
              <button className="icon-btn notification-btn" title="Alertas de Sistema">
              <IoNotificationsOutline />
              <span className="notification-dot"></span>
            </button>
            </NavLink>
          </div>

          <div className="separator-vertical"></div>

          {/* Perfil do Usuário */}
          {currentUser ? (
            <div className="profile-wrapper" ref={profileDropdownRef}>
              <button 
                className={`profile-trigger ${isProfileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <img 
                  src={currentUser.photoURL || userAvatarPlaceholder} 
                  alt="Avatar Operador" 
                  className="user-avatar" 
                />
                <span className="user-name-short">{currentUser.displayName?.split(' ')[0] || 'OP-01'}</span>
              </button>

              {/* Dropdown Técnico */}
              <div className={`dropdown-menu-tech ${isProfileDropdownOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                  <span className="user-full-name">{currentUser.displayName || 'OPERADOR NÃO IDENTIFICADO'}</span>
                  <span className="user-email">{currentUser.email}</span>
                </div>

                <div className="dropdown-divider" />

                <Link to="/perfil" className="dropdown-item">
                  <IoPersonOutline /> DADOS DO OPERADOR
                </Link>
                <Link to="/ranking" className="dropdown-item">
                  <IoTrophyOutline /> CLASSIFICAÇÃO
                </Link>
                <Link to="/curtidas" className="dropdown-item">
                  <IoHeartOutline /> PAINEL DE FAVORITOS
                </Link>

                <div className="dropdown-divider" />

                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <IoLogOutOutline /> ENCERRAR SESSÃO
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn-tech">CONECTAR</Link>
          )}

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;