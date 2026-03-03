// src/components/course/LessonSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5';
import './LessonSidebar.css';

const LessonSidebar = ({ course, activeLessonId }) => {
  return (
    <aside className="lesson-sidebar">
      {/* Seção de Progresso */}
      <div className="progress-container">
        <div className="progress-header">
            {/* Ícone de anel com efeito de progresso */}
            <div className="module-icon-wrapper progress">
              <div className="module-icon-inner"></div>
            </div>
            <div className="progress-info">
                <p className="progress-title">Meu Progresso - 72.5%</p>
                <p className="progress-subtitle">296 de 408 aulas</p>
            </div>
        </div>
      </div>

      {/* Lista de Módulos */}
      <nav className="module-nav-list">
        <ul>
          {course.modules.map(module => (
            <li key={module.id} className="module-item">
                <div className="module-header">
                    {/* Ícone de anel padrão */}
                    <div className="module-icon-wrapper">
                        <div className="module-icon-inner"></div>
                    </div>
                    <div className="module-info">
                        <span className="module-title">{module.title}</span>
                        <span className="module-lesson-count">{module.lessons.length} aulas</span>
                    </div>
                </div>
                {/* Lista de Aulas dentro do Módulo */}
                <ul className="lesson-list">
                    {module.lessons.map(lesson => (
                        <li key={lesson.id}>
                        <Link
                            to={`/course/${course.id}/lesson/${lesson.id}`}
                            className={`lesson-link ${lesson.id === activeLessonId ? 'active' : ''}`}
                        >
                            {lesson.completed && <IoCheckmarkCircle className="lesson-icon completed" />}
                            <span className="lesson-title">{lesson.title}</span>
                        </Link>
                        </li>
                    ))}
                </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default LessonSidebar;
