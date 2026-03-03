// src/components/module/ModuleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ModuleCard.css';

// Recebemos 'module' e o 'courseId' para construir o link corretamente
const ModuleCard = ({ module, courseId }) => {
  return (
    // O link pode levar futuramente para a página de aulas do módulo
    <Link to={`/cursos/${courseId}/modulos/${module.id}`} className="module-card">
      <img src={module.imagemUrl} alt={`Capa do módulo ${module.titulo}`} className="module-card-image" />
      <div className="module-card-content">
        <h3 className="module-card-title">{module.titulo}</h3>
      </div>
    </Link>
  );
};

export default ModuleCard;