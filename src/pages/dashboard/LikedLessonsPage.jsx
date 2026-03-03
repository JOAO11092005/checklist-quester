import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { IoHeartDislikeOutline, IoHeart } from 'react-icons/io5';

// Componentes
import LessonSidebar from '../../components/lesson/LessonSidebar';
import LessonActions from '../../components/lesson/LessonActions'; 
import CommentsSection from '../../components/lesson/CommentsSection'; 

import './LikedLessonsPage.css';

const LikedLessonsPage = () => {
  const { currentUser } = useAuth();
  
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados "dummy"
  const [comments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchLikedLessons = async () => {
      if (!currentUser) { setLoading(false); return; }
      try {
        setLoading(true);
        const progressRef = doc(db, 'progress', currentUser.uid);
        const progressSnap = await getDoc(progressRef);
        
        if (progressSnap.exists() && progressSnap.data().likedLessons) {
          const likedLessonsData = progressSnap.data().likedLessons;
          setLessons(likedLessonsData);
          if (likedLessonsData.length > 0) {
            setSelectedLesson(likedLessonsData[0]); 
          }
        } else {
          setLessons([]);
        }
      } catch (err) {
        console.error("Erro ao buscar aulas curtidas:", err);
        setError("Não foi possível carregar as aulas curtidas.");
      } finally {
        setLoading(false);
      }
    };
    fetchLikedLessons();
  }, [currentUser]);

  const handleLessonClick = (lesson) => setSelectedLesson(lesson);
  
  const currentLessonIndex = useMemo(() => 
    lessons.findIndex(l => l.id === selectedLesson?.id), [lessons, selectedLesson]
  );
  
  const handleNext = () => { 
    if (currentLessonIndex < lessons.length - 1) setSelectedLesson(lessons[currentLessonIndex + 1]); 
  };
  
  const handlePrevious = () => { 
    if (currentLessonIndex > 0) setSelectedLesson(lessons[currentLessonIndex - 1]); 
  };

  if (loading) return (
    <div className="liked-loading-container">
      <div className="spinner-heart"></div>
      <p>Carregando sua playlist...</p>
    </div>
  );

  if (error) return <div className="liked-error-container">{error}</div>;

  return (
    <div className="liked-layout-container">
      
      {/* 1. Conteúdo Principal (Agora na ESQUERDA) */}
      <main className="liked-main-content">
        {selectedLesson ? (
          <div className="content-max-width">
            
            {/* Breadcrumb e Título */}
            <div className="liked-header-nav">
              <div className="breadcrumb-pink">
                 <span>Favoritos</span> &gt; <span className="highlight">{selectedLesson.moduleTitle || 'Geral'}</span>
              </div>
              <h1 className="main-lesson-title">{selectedLesson.titulo}</h1>
            </div>

            {/* Player com Glow Rosa */}
            <div className="video-frame-glow pink-variant">
              {selectedLesson.iframeUrl || selectedLesson.videoUrl ? (
                <iframe 
                  src={selectedLesson.iframeUrl || selectedLesson.videoUrl} 
                  title={selectedLesson.titulo} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="no-video-placeholder">Vídeo não disponível.</div>
              )}
            </div>
            
            <div className="lesson-actions-wrapper">
               <LessonActions
                  onMarkAsSeen={() => {}}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isCompleted={selectedLesson.completed}
                  isFirst={currentLessonIndex === 0}
                  isLast={currentLessonIndex === lessons.length - 1}
                  onLike={() => {}} 
                  onDislike={() => {}}
                  likeStatus={'liked'} 
                />
            </div>
            
            <div className="about-lesson-box pink-border">
              <h3><IoHeart className="icon-heart-small"/> Sobre esta aula</h3>
              <p>{selectedLesson.descricao || 'Descrição não disponível.'}</p>
            </div>
            
            <div style={{ display: 'none' }}>
                <CommentsSection 
                    comments={comments} 
                    newComment={newComment} 
                    onSetNewComment={setNewComment} 
                    onSubmitComment={(e) => e.preventDefault()} 
                />
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="empty-state-pink">
            <div className="empty-icon-circle">
                <IoHeartDislikeOutline />
            </div>
            <h2>Sua lista está vazia</h2>
            <p>Você ainda não curtiu nenhuma aula. Volte ao curso e marque suas favoritas.</p>
            <Link to="/dashboard" className="btn-back-pink">Ir para o Dashboard</Link>
          </div>
        )}
      </main>

      {/* 2. Sidebar (Agora na DIREITA) */}
      <LessonSidebar 
        lessons={lessons} 
        onLessonClick={handleLessonClick} 
        activeLessonId={selectedLesson?.id}
        moduleTitle="Minha Playlist" 
      />
      
    </div>
  );
};

export default LikedLessonsPage;