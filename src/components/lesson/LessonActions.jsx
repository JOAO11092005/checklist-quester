import React from 'react';
// Importa todos os ícones necessários, preenchidos e de contorno
import { 
  IoThumbsUp, IoThumbsUpOutline, 
  IoThumbsDown, IoThumbsDownOutline, 
  IoCheckmarkCircle 
} from 'react-icons/io5';

// As props agora incluem onDislike e a prop unificada 'likeStatus'
const LessonActions = ({ 
  onMarkAsSeen, onNext, onPrevious, isCompleted, isFirst, isLast, 
  onLike, onDislike, likeStatus 
}) => {
  return (
    <div className="lesson-actions">
      <div className="feedback-buttons">
        {/* Botão de Curtir (agora verifica o status 'liked') */}
        <button 
          className={`action-btn like-btn ${likeStatus === 'liked' ? 'liked' : ''}`} 
          onClick={onLike}
        >
          {likeStatus === 'liked' ? <IoThumbsUp size={20} /> : <IoThumbsUpOutline size={20} />}
        </button>

        {/* Botão de Não Curtir (agora funcional) */}
        <button 
          className={`action-btn dislike-btn ${likeStatus === 'disliked' ? 'disliked' : ''}`} 
          onClick={onDislike}
        >
          {likeStatus === 'disliked' ? <IoThumbsDown size={20} /> : <IoThumbsDownOutline size={20} />}
        </button>
      </div>

      <div className="completion-buttons">
        <button 
          className={`mark-complete-btn ${isCompleted ? 'completed' : ''}`}
          onClick={onMarkAsSeen}
        >
          <IoCheckmarkCircle size={20} />
          {isCompleted ? 'Aula Concluída' : 'Marcar como visto'}
        </button>
      </div>

      <div className="navigation-buttons">
        <button className="action-btn" onClick={onPrevious} disabled={isFirst}>
          &larr; Anterior
        </button>
        <button className="action-btn" onClick={onNext} disabled={isLast}>
          Próximo &rarr;
        </button>
      </div>
    </div>
  );
};

export default LessonActions;