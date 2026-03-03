// src/components/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um "ouvinte" que verifica em tempo real
    // se o estado de autenticação do usuário mudou (login/logout).
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Mostra uma tela de carregamento enquanto verifica o usuário
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Verificando autenticação...</div>;
  }

  // Se não houver usuário, redireciona para a página de login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Se houver um usuário, renderiza o conteúdo da rota filha (no nosso caso, o MainLayout)
  return <Outlet />;
};

export default ProtectedRoute;