import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs, setDoc, deleteField, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

// Componentes da página
import LessonSidebar from '../../components/lesson/LessonSidebar';
import LessonActions from '../../components/lesson/LessonActions';
import CommentsSection from '../../components/lesson/CommentsSection';
import SaveToast from '../../components/common/SaveToast';
import LessonDescription from '../../components/lesson/LessonDescription';
import Loader from '../../components/common/Loader';

import './ModulePage.css';
import './modulepage.responsive.css'; 

const ModulePage = () => {
  const { courseId, moduleId } = useParams();
  const { currentUser } = useAuth();
  
  const completionTimerRef = useRef(null);

  // --- STATES ---
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleDetails, setModuleDetails] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [comments, setComments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser || !courseId || !moduleId) { 
        setLoading(false); 
        return; 
      }
      
      setLoading(true);
      setError(null);

      try {
        const progressRef = doc(db, 'progress', currentUser.uid);
        const courseDocRef = doc(db, 'cursos', courseId);
        const moduleDocRef = doc(db, 'cursos', courseId, 'modulos', moduleId);
        const lessonsCollectionRef = collection(db, 'cursos', courseId, 'modulos', moduleId, 'aulas');

        const [progressSnap, courseSnap, moduleSnap, lessonsSnapshot] = await Promise.all([
          getDoc(progressRef), 
          getDoc(courseDocRef), 
          getDoc(moduleDocRef),
          getDocs(lessonsCollectionRef)
        ]);

        const progressData = progressSnap.exists() ? progressSnap.data() : {};
        const completedLessonsMap = progressData.lessons || {};
        const feedbackData = progressData.lessonFeedback || {};

        if (courseSnap.exists()) setCourseTitle(courseSnap.data().titulo);
        else throw new Error("Rota não encontrada no servidor.");
        
        if (moduleSnap.exists()) setModuleDetails(moduleSnap.data());
        else throw new Error("Pacote de dados não encontrado.");

        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completed: completedLessonsMap[doc.id] === true,
          likeStatus: feedbackData[doc.id] || null 
        }));

        lessonsData.sort((a, b) => {
          if (typeof a.numero === 'number' && typeof b.numero === 'number') {
            return a.numero - b.numero;
          }
          return (a.criadoEm?.seconds || 0) - (b.criadoEm?.seconds || 0);
        });

        setLessons(lessonsData);
        
        if (lessonsData.length > 0) {
          setSelectedLesson(lessonsData[0]);
        }

      } catch (err) {
        console.error("Erro ao carregar conteúdo:", err);
        setError("Falha de comunicação. Não foi possível carregar a transmissão.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [courseId, moduleId, currentUser]);

  // --- TIMER DE CONCLUSÃO AUTOMÁTICA ---
  useEffect(() => {
    clearTimeout(completionTimerRef.current);
    
    if (selectedLesson && !selectedLesson.completed && selectedLesson.tipo !== 'exercicio') {
      completionTimerRef.current = setTimeout(() => {
        handleMarkAsSeen(true); 
      }, 60000); 
    }
    
    return () => clearTimeout(completionTimerRef.current);
  }, [selectedLesson]);

  // --- NAVEGAÇÃO ---
  const currentLessonIndex = useMemo(() => 
    lessons.findIndex(l => l.id === selectedLesson?.id), 
    [lessons, selectedLesson]
  );

  const handleNext = () => { 
    if (currentLessonIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentLessonIndex + 1]); 
    }
  };
  
  const handlePrevious = () => { 
    if (currentLessonIndex > 0) {
      setSelectedLesson(lessons[currentLessonIndex - 1]); 
    }
  };

  // --- AÇÕES DO USUÁRIO ---
  const handleMarkAsSeen = async (forceState = null) => {
    if (!currentUser || !selectedLesson) return;
    
    const lessonId = selectedLesson.id;
    const newState = forceState !== null ? forceState : !selectedLesson.completed;

    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: newState } : l));
    setSelectedLesson(prev => ({ ...prev, completed: newState }));

    try {
      await setDoc(doc(db, 'progress', currentUser.uid), {
        lessons: { [lessonId]: newState }
      }, { merge: true });
      
      if (newState) {
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      }
    } catch (e) { 
      console.error("Erro ao salvar telemetria:", e);
    }
  };

  const handleFeedback = async (feedbackType) => {
    if (!currentUser || !selectedLesson) return;
    
    const progressRef = doc(db, 'progress', currentUser.uid);
    const lessonId = selectedLesson.id;
    const currentStatus = selectedLesson.likeStatus;
    const newStatus = currentStatus === feedbackType ? null : feedbackType;

    const updatedLessons = lessons.map(l =>
      l.id === lessonId ? { ...l, likeStatus: newStatus } : l
    );
    setLessons(updatedLessons);
    setSelectedLesson(prev => ({ ...prev, likeStatus: newStatus }));

    try {
      const likedLessonPayload = {
        id: lessonId,
        titulo: selectedLesson.titulo,
        imagemUrl: moduleDetails?.imagemUrl || '',
        courseId, 
        moduleId, 
        courseTitle,
        moduleTitle: moduleDetails?.titulo || '',
        iframeUrl: selectedLesson.iframeUrl || selectedLesson.videoUrl || '',
        descricao: selectedLesson.descricao || '',
      };

      if (newStatus === 'liked') {
        await setDoc(progressRef, {
          lessonFeedback: { [lessonId]: 'liked' },
          likedLessons: arrayUnion(likedLessonPayload)
        }, { merge: true });
      } else {
        const progressSnap = await getDoc(progressRef);
        const currentLikedLessons = progressSnap.data()?.likedLessons || [];
        const updatedLikedLessons = currentLikedLessons.filter(l => l.id !== lessonId);
        const feedbackValue = newStatus === null ? deleteField() : newStatus;

        await setDoc(progressRef, {
          lessonFeedback: { [lessonId]: feedbackValue },
          likedLessons: updatedLikedLessons
        }, { merge: true });
      }
    } catch (err) {
      console.error("Erro ao registrar feedback:", err);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentToAdd = { 
      id: Date.now(), 
      author: currentUser.displayName || 'OP_DESCONHECIDO', 
      text: newComment,
      timestamp: new Date()
    };
    
    setComments(prev => [commentToAdd, ...prev]);
    setNewComment('');
  };

  // --- RENDERIZADOR DE CONTEÚDO ---
  const renderMainContent = () => {
    const url = selectedLesson.contentUrl || selectedLesson.iframeUrl || selectedLesson.videoUrl;
    const isExercise = selectedLesson.tipo === 'exercicio';

    // Renderização Técnica para Exercícios (Substitui o estilo Notion)
    if (isExercise) {
      return (
        <div className="tech-exercise-container">
          <div className="exercise-header">
            <span className="exercise-badge">PROTOCOLO DE TESTE</span>
            <h2 className="tech-title">{selectedLesson.titulo}</h2>
          </div>
          
          <div className="tech-instructions">
            <p className="tech-label">PARÂMETROS DE EXECUÇÃO:</p>
            <ul className="tech-list">
              <li>Acesse a documentação externa via link seguro.</li>
              <li>Tente compilar e resolver a lógica de forma autônoma.</li>
              <li>Em caso de falha crítica, utilize a rede de suporte nos comentários.</li>
            </ul>
          </div>

          <div className="tech-link-section">
            <span className="tech-link-label">ENDPOINT DO DESAFIO: </span>
            <a href={url} target="_blank" rel="noreferrer" className="tech-url">
              {url || 'N/A'}
            </a>
          </div>
        </div>
      );
    }

    // Renderização de Vídeo (Estilo Terminal)
    if (url) {
      return (
        <div className="video-frame-tech">
          <iframe 
            src={url} 
            title={selectedLesson.titulo} 
            allowFullScreen 
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>
      );
    }

    return (
      <div className="error-state">
        <AlertCircle size={40} />
        <p>SINAL INTERROMPIDO. CONTEÚDO INDISPONÍVEL.</p>
      </div>
    );
  };

  if (loading) return <Loader title="LENDO PACOTE DE DADOS..." />;
  if (error) return <div className="page-status error">ERRO: {error}</div>;

  return (
    <div className="module-page-tech-theme">
      <SaveToast isVisible={showSaveToast} />
      
      <div className="module-main-content">
        {/* Breadcrumb Técnico */}
        <div className="lesson-header-tech">
          <div className="breadcrumb-tech">
            <Link to="/home">BASE</Link>
            <span className="separator">/</span>
            <Link to={`/cursos/${courseId}`}>{courseTitle}</Link>
            <span className="separator">/</span>
            <span>{moduleDetails?.titulo}</span>
          </div>
        </div>

        {selectedLesson ? (
          <div className="lesson-experience-wrapper">
            {selectedLesson.tipo !== 'exercicio' && (
              <h1 className="main-lesson-title">{selectedLesson.titulo}</h1>
            )}
            
            {renderMainContent()}

            <div className="lesson-footer-actions">
              <LessonActions
                onMarkAsSeen={() => handleMarkAsSeen()}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isCompleted={selectedLesson.completed}
                isFirst={currentLessonIndex === 0}
                isLast={currentLessonIndex === lessons.length - 1}
                onLike={() => handleFeedback('liked')}
                onDislike={() => handleFeedback('disliked')}
                likeStatus={selectedLesson.likeStatus}
              />
              
              <div className="tech-description-box">
                <h3 className="box-title">DESCRIÇÃO</h3>
                <div className="divider-line"></div>
                <LessonDescription text={selectedLesson.descricao} />
              </div>

            </div>
          </div>
        ) : (
          <div className="empty-state">AGUARDANDO SELEÇÃO DE TRANSMISSÃO.</div>
        )}
      </div>

      {/* Sidebar Lateral */}
      <div className="module-sidebar-wrapper">
        <LessonSidebar
          lessons={lessons}
          onLessonClick={setSelectedLesson}
          activeLessonId={selectedLesson?.id}
          moduleTitle={moduleDetails?.titulo}
          courseId={courseId}
        />
      </div>
    </div>
  );
};

export default ModulePage;