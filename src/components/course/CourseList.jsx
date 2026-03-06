// src/components/course/CourseList.jsx
import React, { useRef } from 'react';
import CourseCard from './CourseCard';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import './CourseList.css';

const CourseList = ({ courses }) => {
  const scrollRef = useRef(null);

  // Se não houver cursos, exibe uma mensagem
  if (!courses || courses.length === 0) {
    return <p className="no-courses-message">NENHUM PROTOCOLO DISPONÍVEL NO MOMENTO.</p>;
  }

  // Função para rolar o carrossel no mobile
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Rola a largura de um card (~300px) por clique
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="course-list-wrapper">
      {/* Seta Esquerda (Aparece apenas no Mobile) */}
      <button className="scroll-arrow left" onClick={() => scroll('left')}>
        <IoChevronBackOutline />
      </button>

      <div className="course-list" ref={scrollRef}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Seta Direita (Aparece apenas no Mobile) */}
      <button className="scroll-arrow right" onClick={() => scroll('right')}>
        <IoChevronForwardOutline />
      </button>
    </div>
  );
};

export default CourseList;