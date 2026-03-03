// src/components/lesson/CommentsSection.jsx
import React from 'react';
import { IoSend } from 'react-icons/io5';

const CommentsSection = ({ comments, newComment, onSetNewComment, onSubmitComment }) => {
  return (
    <div className="comments-section">
      {/* <h4>Comentário ou pergunta sobre a aula</h4> */}
      <form className="comment-form" onSubmit={onSubmitComment}>
        <textarea
          placeholder="Faça sua pergunta..."
          value={newComment}
          onChange={(e) => onSetNewComment(e.target.value)}
        />
        <button type="submit" className="submit-comment-btn">
          Enviar <IoSend size={14} />
        </button>
      </form>
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-author-avatar">
              {comment.author.charAt(0)}
            </div>
            <div className="comment-content">
              <p className="comment-author-name">{comment.author}</p>
              <p className="comment-text">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;