// src/components/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  // O hook useLocation guarda a rota que o usuário tentou acessar
  const location = useLocation();

  useEffect(() => {
    // onAuthStateChanged ouve o Auth do Firebase em tempo real
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true); // Camada 1: Usuário tem cadastro no Auth

        try {
          // Camada 2: Buscar o status do usuário no Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Verifica se o Admin já liberou o acesso
            if (userData.status === 'Active') {
              setIsApproved(true);
            } else {
              setIsApproved(false); // Barrado: Status é 'Pending' ou 'Requested'
            }
          } else {
            setIsApproved(false); // Barrado: Documento não existe no banco
          }
        } catch (error) {
          console.error("Erro de comunicação com o banco de dados:", error);
          setIsApproved(false); // Em caso de erro, bloqueia por segurança
        }
      } else {
        setIsAuthenticated(false); // Ninguém logado
      }
      
      // Finaliza a tela de carregamento
      setLoading(false);
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  // 1. TELA DE CARREGAMENTO (Enquanto valida o Token e o Banco de Dados)
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#000', 
        color: '#8257e5', 
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '2px',
        fontWeight: 'bold'
      }}>
        VALIDANDO CREDENCIAIS DE ACESSO...
      </div>
    );
  }

  // 2. BLOQUEIO NÍVEL 1: Se não estiver logado, expulsa para a tela de Login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. BLOQUEIO NÍVEL 2: Se está logado, mas não está aprovado, manda para pedir convite
  if (!isApproved) {
    // Se ele já estiver na tela de request-invite, não faz nada para evitar loop infinito
    if (location.pathname === '/request-invite') {
       return <Outlet />;
    }
    return <Navigate to="/request-invite" replace />;
  }

  // 4. ACESSO LIBERADO: Se passou nas duas camadas, renderiza o Dashboard (MainLayout)
  return <Outlet />;
};

export default ProtectedRoute;