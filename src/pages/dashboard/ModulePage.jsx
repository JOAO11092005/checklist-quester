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
import './modulepage.responsive.css'; // Mantendo a importação do responsivo se existir

const ModulePage = () => {
  const { courseId, moduleId } = useParams();
  const { currentUser } = useAuth();
  
  // Ref para o timer de conclusão automática
  const completionTimerRef = useRef(null);

  // --- STATES ---
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleDetails, setModuleDetails] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [comments, setComments] = useState([]); // Inicia vazio, lógica de backend seria ideal aqui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);

  // --- BUSCA DE DADOS (DATA FETCHING) ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser || !courseId || !moduleId) { 
        setLoading(false); 
        return; 
      }
      
      setLoading(true);
      setError(null);

      try {
        // Referências
        const progressRef = doc(db, 'progress', currentUser.uid);
        const courseDocRef = doc(db, 'cursos', courseId);
        const moduleDocRef = doc(db, 'cursos', courseId, 'modulos', moduleId);
        const lessonsCollectionRef = collection(db, 'cursos', courseId, 'modulos', moduleId, 'aulas');

        // Buscas paralelas
        const [progressSnap, courseSnap, moduleSnap, lessonsSnapshot] = await Promise.all([
          getDoc(progressRef), 
          getDoc(courseDocRef), 
          getDoc(moduleDocRef),
          getDocs(lessonsCollectionRef)
        ]);

        // Processamento do Progresso e Feedback
        const progressData = progressSnap.exists() ? progressSnap.data() : {};
        const completedLessonsMap = progressData.lessons || {};
        const feedbackData = progressData.lessonFeedback || {};

        // Validação básica
        if (courseSnap.exists()) setCourseTitle(courseSnap.data().titulo);
        else throw new Error("Curso não encontrado.");
        
        if (moduleSnap.exists()) setModuleDetails(moduleSnap.data());
        else throw new Error("Módulo não encontrado.");

        // Processamento das Aulas
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completed: completedLessonsMap[doc.id] === true,
          likeStatus: feedbackData[doc.id] || null // Recupera se deu like/dislike
        }));

        // Ordenação
        lessonsData.sort((a, b) => {
          if (typeof a.numero === 'number' && typeof b.numero === 'number') {
            return a.numero - b.numero;
          }
          return (a.criadoEm?.seconds || 0) - (b.criadoEm?.seconds || 0);
        });

        setLessons(lessonsData);
        
        // Seleciona a primeira aula se nenhuma estiver selecionada
        if (lessonsData.length > 0) {
          setSelectedLesson(lessonsData[0]);
        }

      } catch (err) {
        console.error("Erro ao carregar conteúdo:", err);
        setError("Não foi possível carregar o conteúdo do módulo.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [courseId, moduleId, currentUser]);

  // --- TIMER DE CONCLUSÃO AUTOMÁTICA (Lógica do Código Antigo) ---
  useEffect(() => {
    clearTimeout(completionTimerRef.current);
    
    // Só inicia o timer se a aula não for exercício e não estiver completa
    if (selectedLesson && !selectedLesson.completed && selectedLesson.tipo !== 'exercicio') {
      completionTimerRef.current = setTimeout(() => {
        handleMarkAsSeen(true); // Força marcação como visto
      }, 60000); // 1 minuto
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

  // Marcar como visto
  const handleMarkAsSeen = async (forceState = null) => {
    if (!currentUser || !selectedLesson) return;
    
    const lessonId = selectedLesson.id;
    // Se forceState for passado (pelo timer), usa ele. Senão, inverte o atual.
    const newState = forceState !== null ? forceState : !selectedLesson.completed;

    // Atualiza estado local instantaneamente (Optimistic UI)
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
      console.error("Erro ao salvar progresso:", e);
      // Reverter em caso de erro poderia ser implementado aqui
    }
  };

  // Sistema de Feedback (Like/Dislike) - Recuperado do Código Antigo
  const handleFeedback = async (feedbackType) => {
    if (!currentUser || !selectedLesson) return;
    
    const progressRef = doc(db, 'progress', currentUser.uid);
    const lessonId = selectedLesson.id;
    const currentStatus = selectedLesson.likeStatus;
    // Se clicar no mesmo, remove o like (toggle). Se for diferente, troca.
    const newStatus = currentStatus === feedbackType ? null : feedbackType;

    // Atualiza estado local
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
        // Adiciona Like
        await setDoc(progressRef, {
          lessonFeedback: { [lessonId]: 'liked' },
          likedLessons: arrayUnion(likedLessonPayload)
        }, { merge: true });
      } else {
        // Remove Like ou Adiciona Dislike
        // Nota: Para remover de um array arrayUnion não funciona simples,
        // mas aqui estamos simplificando a lógica de feedback do documento principal
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
      console.error("Erro ao salvar feedback:", err);
    }
  };

  // Sistema de Comentários
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentToAdd = { 
      id: Date.now(), 
      author: currentUser.displayName || 'Usuário', 
      text: newComment,
      timestamp: new Date()
    };
    
    setComments(prev => [commentToAdd, ...prev]);
    setNewComment('');
    // Aqui você adicionaria a lógica para salvar no Firebase se necessário
  };

  // --- RENDERIZADOR DE CONTEÚDO (NOTION STYLE + VIDEO) ---
  const renderMainContent = () => {
    const url = selectedLesson.contentUrl || selectedLesson.iframeUrl || selectedLesson.videoUrl;
    const isExercise = selectedLesson.tipo === 'exercicio';

    // Renderização Estilo Notion para Exercícios
    if (isExercise) {
      return (
        <div className="notion-exercise-container">
          <h2 className="notion-title">{selectedLesson.titulo}</h2>
          
          <div className="notion-instructions">
            <p className="notion-label">Instruções:</p>
            <ul className="notion-list">
              <li>Acesse as páginas abaixo e leia a instrução do exercício com calma.</li>
              <li>Tente realizar os desafios propostos sozinho.</li>
              <li>Caso tenha dúvidas, utilize a seção de comentários abaixo ou o suporte.</li>
            </ul>
          </div>

          <div className="notion-link-section">
            <span className="notion-link-label">Link do Exercício: </span>
            <a href={url} target="_blank" rel="noreferrer" className="notion-url">
              {url || 'Link indisponível'}
            </a>
          </div>
        </div>
      );
    }

    // Renderização de Vídeo Padrão
    if (url) {
      return (
        <div className="video-frame-glow">
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
        <p>Conteúdo não disponível.</p>
      </div>
    );
  };

  if (loading) return <Loader title="Carregando módulo..." />;
  if (error) return <div className="page-status error">Erro: {error}</div>;

  return (
    <div className="module-page-dark-theme">
      <SaveToast isVisible={showSaveToast} />
      
      <div className="module-main-content">
        {/* Breadcrumb / Header */}
        <div className="lesson-header-modern">
          <div className="breadcrumb-premium">
            <Link to="/home">Início</Link>
            <span className="separator">/</span>
            <Link to={`/cursos/${courseId}`}>{courseTitle}</Link>
            <span className="separator">/</span>
            <span>{moduleDetails?.titulo}</span>
          </div>
        </div>

        {selectedLesson ? (
          <div className="lesson-experience-wrapper">
            {/* Título (apenas se não for exercício, pois exercício já tem título interno estilo Notion) */}
            {selectedLesson.tipo !== 'exercicio' && (
              <h1 className="main-lesson-title">{selectedLesson.titulo}</h1>
            )}
            
            {/* Área Principal (Vídeo ou Exercício) */}
            {renderMainContent()}

            {/* Barra de Ações (Anterior, Próximo, Visto, Likes) */}
            <div className="lesson-footer-actions">
              <LessonActions
                onMarkAsSeen={() => handleMarkAsSeen()}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isCompleted={selectedLesson.completed}
                isFirst={currentLessonIndex === 0}
                isLast={currentLessonIndex === lessons.length - 1}
                // Props adicionadas do código antigo:
                onLike={() => handleFeedback('liked')}
                onDislike={() => handleFeedback('disliked')}
                likeStatus={selectedLesson.likeStatus}
              />
              
              {/* Descrição */}
              <div className="glass-description-box">
                <h3>Descrição</h3>
                <LessonDescription text={selectedLesson.descricao} />
              </div>

              {/* Seção de Comentários */}
              {/* <div className="comments-wrapper-modern">
                <CommentsSection
                  comments={comments}
                  newComment={newComment}
                  onSetNewComment={setNewComment}
                  onSubmitComment={handleCommentSubmit}
                />
              </div> */}
            </div>
          </div>
        ) : (
          <div className="empty-state">Selecione um conteúdo para começar.</div>
        )}
      </div>

      {/* Sidebar Lateral */}
      <LessonSidebar
        lessons={lessons}
        onLessonClick={setSelectedLesson}
        activeLessonId={selectedLesson?.id}
        moduleTitle={moduleDetails?.titulo}
        courseId={courseId}
      />
    </div>
  );
};

export default ModulePage;