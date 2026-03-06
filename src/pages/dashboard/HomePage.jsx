import React, { useState, useEffect } from 'react';
import CourseList from '../../components/course/CourseList';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { IoTerminalOutline, IoLayersOutline } from 'react-icons/io5';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccessKey, setHasAccessKey] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Estado para detectar celular
  const { currentUser } = useAuth();

  // GIF para o fundo Mobile
  const mobileGifUrl = "https://user-images.githubusercontent.com/81328619/213875785-400ae517-156b-4aca-a787-bac75d84c393.gif";

  // Verifica o tamanho da tela na montagem e no redimensionamento
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Executa a primeira vez
    checkMobile();
    
    // Adiciona listener para caso o usuário redimensione a janela (Desktop) ou vire o celular
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Temporizador do Vídeo (Só roda se NÃO for mobile)
  useEffect(() => {
    if (isMobile) return; // Se for celular, aborta o timer do vídeo

    const videoTimer = setTimeout(() => {
      setShowVideo(true);
    }, 4000);
    
    return () => clearTimeout(videoTimer);
  }, [isMobile]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let coursesQuery = collection(db, "cursos");
        let userHasAccess = false;

        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;

          if (userData && userData.accessKey === 'curso2025') {
            userHasAccess = true;
            const accessKeysDoc = await getDoc(doc(db, 'accessKeys', 'curso2025'));
            const restrictedCoursesIds = accessKeysDoc.exists() ? accessKeysDoc.data().courses : [];

            if (restrictedCoursesIds.length > 0) {
              coursesQuery = query(collection(db, "cursos"), where('__name__', 'in', restrictedCoursesIds));
            } else {
              coursesQuery = null;
            }
          }
        }

        let coursesData = [];
        if (coursesQuery) {
          const querySnapshot = await getDocs(coursesQuery); 
          coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        setCourses(coursesData);
        setHasAccessKey(userHasAccess);
      } catch (error) {
        console.error("Erro ao buscar dados: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentUser]);

  if (loading) return <Loader title="SINCRONIZANDO BASE DE DADOS..." />;

  return (
    <div className="home-master-container">
      <div className="home-tech-grid"></div>

      {/* --- HERO SECTION --- */}
      <header className="home-hero">
        
        {/* Lógica Renderização Mobile vs Desktop */}
        {isMobile ? (
          /* CAMADA MOBILE: Carrega o GIF com filtro técnico em loop infinito */
          <div className="hero-media-layer media-visible">
            <img 
              src={mobileGifUrl} 
              alt="System Data Flow" 
              className="hero-mobile-gif" 
            />
          </div>
        ) : (
          /* CAMADAS DESKTOP: Imagem estática seguida pelo Vídeo do Vimeo */
          <>
            <div className={`hero-media-layer hero-bg-image ${hasAccessKey ? 'premium-bg' : 'standard-bg'} ${showVideo ? 'media-hidden' : 'media-visible'}`}></div>

            <div className={`hero-media-layer hero-bg-video ${showVideo ? 'media-visible' : 'media-hidden'}`}>
              {showVideo && (
                <iframe
                  src="https://player.vimeo.com/video/1092215058?muted=1&autoplay=1&dnt=1&loop=1&background=1&app_id=122963"
                  allow="autoplay; fullscreen; picture-in-picture"
                  frameBorder="0"
                  title="Background Video"
                ></iframe>
              )}
            </div>
          </>
        )}

        {/* Camada 3: Overlay (A Mágica da Legibilidade e Estética) */}
        <div className="hero-overlay"></div>

        {/* Camada 4: Conteúdo de Texto */}
        <div className="hero-main-content">
          <h1 className="hero-display-title">
            {hasAccessKey ? (
              <>AMBIENTE DE <br/><span className="text-highlight">ALTA PERFORMANCE</span></>
            ) : (
              <>DESENVOLVIMENTO<br/><span className="text-highlight">WEB</span></>
            )}
          </h1>

          <p className="hero-description">
            {hasAccessKey 
              ? 'Todos os módulos operacionais estão destravados. Prossiga com o treinamento.' 
              : 'Estabeleça a conexão com os módulos de treinamento e inicie o curso.'}
          </p>

          {!hasAccessKey && (
            <div className="hero-actions">
              <a href="#cursos" className="btn-hero-tech">
                INICIAR EXECUÇÃO 
              </a>
            </div>
          )}
        </div>
      </header>

      {/* --- SEÇÃO DE ROTAS (CURSOS) --- */}
      <main className="home-content" id="cursos">
        <div className="section-header">
          <div className="title-group">
            <span className="subtitle-tech">DATA REPOSITORY</span>
            <h2>Rotas de Aprendizado Disponíveis</h2>
          </div>
          <div className="header-line"></div>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state-card">
            <IoLayersOutline size={48} style={{ marginBottom: '15px', color: '#555' }} />
            <p>Nenhum protocolo de treinamento encontrado para a sua credencial atual.</p>
          </div>
        ) : (
          <div className="courses-grid-wrapper">
            <CourseList courses={courses} />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;