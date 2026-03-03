// src/components/course/CourseList.jsx
import React from 'react';
import CourseCard from './CourseCard'; // Importe o novo componente
import './CourseList.css';

const CourseList = ({ courses }) => {
  // Se não houver cursos, exibe uma mensagem
  if (!courses || courses.length === 0) {
    return <p className="no-courses-message">Nenhum curso disponível no momento.</p>;
  }

  return (
    <div className="course-list">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;