// src/components/common/Input.jsx
import React from 'react';
import './common.css'; // Usaremos um CSS para estilizar

const Input = (props) => {
  // O {...props} permite passar qualquer propriedade de input (type, placeholder, etc)
  return <input className="custom-input" {...props} />;
};

export default Input;