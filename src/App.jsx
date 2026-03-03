import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Importação dos estilos
import 'react-toastify/dist/ReactToastify.css';
import './styles/ToastCustom.css'; // Vamos criar este arquivo abaixo

// Importe suas páginas e componentes
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/dashboard/HomePage';
import RankingPage from './pages/dashboard/RankingPage';
import CourseDetailPage from './pages/dashboard/CourseDetailPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ChatPage from './pages/dashboard/ChatPage.jsx';
import ModulePage from './pages/dashboard/ModulePage';
import NotFoundPage from './pages/NotFoundPage';
import LikedLessonsPage from './pages/dashboard/LikedLessonsPage';
import Ajuda from './pages/Ajuda';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Caminho from './pages/dashboard/TracksPage.jsx'
import SearchPage from './pages/dashboard/SearchPage.jsx';
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';

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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    errorElement: <NotFoundPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
        children: [
          { path: '/home', element: <HomePage /> },
          { path: '/ranking', element: <RankingPage /> },
          { path: '/cursos/:courseId', element: <CourseDetailPage /> },
          { path: '/cursos/:courseId/modulos/:moduleId', element: <ModulePage /> },
          { path: '/perfil', element: <ProfilePage /> },
          { path: "/ajuda", element: <Ajuda /> },
          { path: '/duvidas', element: <ChatPage /> },
          { path: '/curtidas', element: <LikedLessonsPage /> },
          { path: '/trilhas' , element: <Caminho />},
          { path: '/search', element: <SearchPage />},
          { path: '/notificacao', element: <NotificationsPage />},
           { path: '/estatistica', element: <Dashboard />},
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
        theme="dark" // Mudamos de 'colored' para 'dark' para casar com o sistema
      />
    </>
  );
}

export default App;