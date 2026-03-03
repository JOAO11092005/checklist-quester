// src/components/course/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoTerminalOutline } from 'react-icons/io5';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/cursos/${course.id}`} className="course-card-tech">
      <div className="card-image-wrapper">
        <img 
          src={course.imagemUrl} 
          alt={`Dados visuais da rota ${course.titulo}`} 
          className="card-image-tech" 
        />
        <div className="card-overlay-tech"></div>
        <div className="card-status-badge">ONLINE</div>
      </div>

      <div className="card-info-tech">
        <span className="card-tag-tech">[{course.tipo || 'ROTA PADRÃO'}]</span>
        <h3 className="card-title-tech">{course.titulo}</h3>

        <div className="card-footer-tech">
          <span className="footer-text">INICIAR SEQUÊNCIA</span>
          <IoTerminalOutline className="footer-icon" />
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;