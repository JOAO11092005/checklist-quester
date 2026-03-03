// src/components/common/Button.jsx
import React from 'react';
import './common.css'; // Usaremos o mesmo CSS

const Button = ({ children, ...props }) => {
  // O {children} é o texto que vai dentro do botão
  return (
    <button className="custom-button" {...props}>
      {children}
    </button>
  );
};

export default Button;