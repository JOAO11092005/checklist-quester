// src/components/module/ModuleList.jsx
import React from 'react';
import ModuleCard from './ModuleCard';
import './ModuleList.css';

const ModuleList = ({ modules, courseId }) => {
  if (!modules || modules.length === 0) {
    return <p className="no-modules-message">Nenhum módulo encontrado para este curso.</p>;
  }

  return (
    <div className="module-list">
      {modules.map(module => (
        <ModuleCard key={module.id} module={module} courseId={courseId} />
      ))}
    </div>
  );
};

export default ModuleList;