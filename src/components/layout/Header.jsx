import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase/config'; // Adicionado db aqui
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Imports do Firestore
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
  const [unreadCount, setUnreadCount] = useState(0); // Estado para guardar qtd de e-mails
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Alias de email do usuário (ex: joao@devweb.com)
  const myDevEmail = currentUser?.email ? `${currentUser.email.split('@')[0].toLowerCase()}@devweb.com` : '';

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

  // Busca emails não lidos em TEMPO REAL
  useEffect(() => {
    if (!myDevEmail) return;

    // Procura na caixa de entrada e-mails que são PARA mim e que estão como read: false
    const qUnread = query(
      collection(db, 'emails'), 
      where('to', '==', myDevEmail),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(qUnread, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    }, (error) => {
      console.error("Erro ao buscar notificações: ", error);
    });

    return () => unsubscribe();
  }, [myDevEmail]);

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
            <NavLink to="/search" className="icon-link">
              <button className="icon-btn" title="Buscar no Banco de Dados">
                <IoSearch />
              </button>
            </NavLink>
            <NavLink to="/notificacao" className="icon-link">
              <button className="icon-btn notification-btn" title="Alertas de Sistema">
                <IoNotificationsOutline />
                {/* Se houver e-mails não lidos, exibe o Badge numérico */}
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
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
                  <span className="user-email">{myDevEmail || currentUser.email}</span>
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