import React from 'react';
import { IoCheckmark, IoPlay, IoLockClosed } from 'react-icons/io5';
import './LessonSidebar.css';

const LessonSidebar = ({ lessons, onLessonClick, activeLessonId, moduleTitle }) => {
  // Cálculos de progresso
  const completedCount = lessons.filter(l => l.completed).length; 
  const total = lessons.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <aside className="star-sb-container">
      {/* --- Header Técnico --- */}
      <div className="star-sb-header">
        <div className="star-sb-header-content">
          <span className="star-sb-overline">DIRETÓRIO ATUAL</span>
          <h2 className="star-sb-title">{moduleTitle || "SISTEMA PRINCIPAL"}</h2>
          
          <div className="star-sb-prog-wrapper">
            <div className="star-sb-prog-labels">
              <span>{percentage}% PROCESSADO</span>
              <span>{completedCount} / {total} ARQUIVOS</span>
            </div>
            <div className="star-sb-prog-track">
              <div 
                className="star-sb-prog-fill" 
                style={{ width: `${percentage}%` }}
              >
                {/* Feixe de leitura (Scanner) */}
                <div className="star-sb-prog-scanner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Lista de Aulas (Timeline Técnica) --- */}
      <div className="star-sb-scroll-area">
        <div className="star-sb-list">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isDone = lesson.completed;
            const isLocked = !isDone && !isActive && index > 0 && !lessons[index-1].completed; 

            return (
              <button 
                key={lesson.id} 
                className={`star-sb-row ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onLessonClick(lesson)}
                disabled={isLocked}
              >
                {/* Coluna Visual (Timeline) */}
                <div className="star-sb-timeline-col">
                  {/* Linha conectora (exceto no último) */}
                  {index !== lessons.length - 1 && <div className="star-sb-timeline-line" />}
                  
                  {/* Ícone de Status (Caixa de Hardware) */}
                  <div className="star-sb-status-box">
                    {isDone ? (
                      <IoCheckmark className="star-sb-icon-check" />
                    ) : isActive ? (
                      <div className="star-sb-icon-play-wrapper">
                        <IoPlay className="star-sb-icon-play" />
                      </div>
                    ) : isLocked ? (
                      <IoLockClosed className="star-sb-icon-lock" />
                    ) : (
                      <span className="star-sb-step-number">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Coluna de Conteúdo */}
                <div className="star-sb-content-col">
                  <span className="star-sb-lesson-name">{lesson.titulo}</span>
                  <div className="star-sb-lesson-meta">
                    <span className="star-sb-type-text">
                      {isLocked ? "ACESSO NEGADO" : isDone ? "VERIFICADO" : "ARQUIVO DE VÍDEO"}
                    </span>
                  </div>
                </div>

                {/* Fundo de Linha Ativa */}
                {isActive && <div className="star-sb-active-bg" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default LessonSidebar;