import React from 'react';
import { IoCheckmark, IoPlay, IoLockClosed } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import './LessonSidebar.css';

const LessonSidebar = ({ lessons, onLessonClick, activeLessonId, moduleTitle }) => {
  // Cálculos de progresso
  const completedCount = lessons.filter(l => l.completed).length; 
  const total = lessons.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <aside className="sidebar-container">
      {/* --- Header com Efeito Glass --- */}
      <div className="sidebar-header">
        <div className="header-content">
          <span className="module-overline">Módulo Atual</span>
          <h2 className="module-title">{moduleTitle || "Masterizando React"}</h2>
          
          <div className="progress-wrapper">
            <div className="progress-labels">
              <span>{percentage}% Concluído </span>
              <span> { completedCount }  /  {total} Aulas</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${percentage}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Lista de Aulas (Timeline) --- */}
      <div className="lessons-scroll-area">
        <div className="lessons-list">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isDone = lesson.completed;
            const isLocked = !isDone && !isActive && index > 0 && !lessons[index-1].completed; 

            return (
              <button 
                key={lesson.id} 
                className={`lesson-row ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onLessonClick(lesson)}
                disabled={isLocked}
              >
                {/* Coluna Visual (Timeline) */}
                <div className="timeline-col">
                  {/* Linha conectora (exceto no último) */}
                  {index !== lessons.length - 1 && <div className="timeline-line" />}
                  
                  {/* Ícone de Status */}
                  <div className="status-indicator">
                    {isDone ? (
                      <IoCheckmark className="icon-check" />
                    ) : isActive ? (
                      <div className="icon-play-wrapper">
                        <FaPlay className="icon-play" />
                      </div>
                    ) : isLocked ? (
                      <IoLockClosed className="icon-lock" />
                    ) : (
                      <span className="step-number">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Coluna de Conteúdo */}
                <div className="content-col">
                  <span className="lesson-name">{lesson.titulo}</span>
                  <div className="lesson-meta">
                    {/* <span className="duration-badge">
                      {lesson.duration || "10 min"}
                    </span> */}
                    <span className="type-text">
                      {isLocked ? "Bloqueado" : isDone ? "Assistido" : "Videoaula"}
                    </span>
                  </div>
                </div>

                {/* Efeito de Brilho Ativo (Fundo) */}
                {isActive && <div className="active-background-glow" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default LessonSidebar;