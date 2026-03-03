// src/components/common/SaveToast.jsx
import React from 'react';
import './SaveToast.css';

const SaveToast = ({ isVisible }) => {
  return (
    <div className={`save-toast ${isVisible ? 'visible' : ''}`}>
      Salvo com sucesso
    </div>
  );
};

export default SaveToast;