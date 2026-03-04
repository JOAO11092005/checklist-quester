// src/components/module/ModuleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoHardwareChipOutline } from 'react-icons/io5';
import './ModuleCard.css';

const ModuleCard = ({ module, courseId }) => {
  return (
    <Link to={`/cursos/${courseId}/modulos/${module.id}`} className="module-card-tech">
      <div className="module-image-container">
        <img 
          src={module.imagemUrl} 
          alt={`Capa do módulo ${module.titulo}`} 
          className="module-image-tech" 
        />
        <div className="module-overlay-tech"></div>
        <div className="module-badge-tech">
          <IoHardwareChipOutline size={14} /> MOD
        </div>
      </div>
      
      <div className="module-content-tech">
        <h3 className="module-title-tech">{module.titulo}</h3>
        <span className="module-status-tech">ACESSAR_PASTA</span>
      </div>
    </Link>
  );
};

export default ModuleCard;