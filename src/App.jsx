import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Importação dos estilos
import 'react-toastify/dist/ReactToastify.css';
import './styles/ToastCustom.css'; 

// Importe suas páginas e componentes de Autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RequestInvitePage from './pages/auth/RequestInvitePage'; 

// Importe suas páginas e componentes do Dashboard
import HomePage from './pages/dashboard/HomePage';
import RankingPage from './pages/dashboard/RankingPage';
import CourseDetailPage from './pages/dashboard/CourseDetailPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ChatPage from './pages/dashboard/ChatPage.jsx';
import ModulePage from './pages/dashboard/ModulePage';
import NotFoundPage from './pages/NotFoundPage';
import LikedLessonsPage from './pages/dashboard/LikedLessonsPage';
import Ajuda from './pages/Ajuda';
import Caminho from './pages/dashboard/TracksPage.jsx';
import SearchPage from './pages/dashboard/SearchPage.jsx';
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';

// 👇 CAMINHO ATUALIZADO AQUI (apontando para a nova pasta 'admin')
import AdminPanel from './pages/components/AdminPanel.jsx'; 

// Importe os Layouts e Proteções
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/request-invite', 
    element: <RequestInvitePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    errorElement: <NotFoundPage />,
  },
  {
    element: <ProtectedRoute />, // Protege todas as rotas filhas
    children: [
      {
        element: <MainLayout />, // Aplica o layout do painel (Sidebar, Header, etc)
        errorElement: <NotFoundPage />,
        children: [
          { path: '/home', element: <HomePage /> },
          { path: '/ranking', element: <RankingPage /> },
          { path: '/cursos/:courseId', element: <CourseDetailPage /> },
          { path: '/cursos/:courseId/modulos/:moduleId', element: <ModulePage /> },
          { path: '/perfil', element: <ProfilePage /> },
          { path: '/ajuda', element: <Ajuda /> },
          { path: '/duvidas', element: <ChatPage /> },
          { path: '/curtidas', element: <LikedLessonsPage /> },
          { path: '/trilhas' , element: <Caminho />},
          { path: '/trilhas/:userId', element: <Caminho /> }, // Rota para admin ver trilha de usuário específico
          { path: '/search', element: <SearchPage />},
          { path: '/notificacao', element: <NotificationsPage />},
          { path: '/estatistica', element: <Dashboard />},
          { path: '/admin', element: <AdminPanel />}, // Rota ADMIN mantida, apenas a importação lá em cima mudou!
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />

      {/* Container customizado para o estilo Dark/Elite */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Mantido escuro para casar com o sistema
      />
    </>
  );
}

export default App;
