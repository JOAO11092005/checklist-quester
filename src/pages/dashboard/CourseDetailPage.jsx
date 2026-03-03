// src/pages/dashboard/CourseDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ModuleList from '../../components/module/ModuleList';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader'; // Importe o Loader

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      setLoading(true);
      setError('');

      try {
        // ✅ NOVO: LÓGICA DE VERIFICAÇÃO DE ACESSO
        let hasAccess = true;

        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;

          if (userData && userData.accessKey === 'curso2025') {
            const accessKeysDoc = await getDoc(doc(db, 'accessKeys', 'curso2025'));
            const restrictedCoursesIds = accessKeysDoc.exists() ? accessKeysDoc.data().courses : [];

            if (!restrictedCoursesIds.includes(courseId)) {
              hasAccess = false;
            }
          }
        }

        if (!hasAccess) {
          setError('Curso não disponível com a sua chave de acesso.');
          setLoading(false);
          return;
        }

        const courseDocRef = doc(db, 'cursos', courseId);
        const courseDocSnap = await getDoc(courseDocRef);

        if (courseDocSnap.exists()) {
          setCourse({ id: courseDocSnap.id, ...courseDocSnap.data() });

          const modulesCollectionRef = collection(db, 'cursos', courseId, 'modulos');
          const modulesSnapshot = await getDocs(modulesCollectionRef);

          const modulesData = modulesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          modulesData.sort((a, b) => a.criadoEm.seconds - b.criadoEm.seconds);
          setModules(modulesData);

        } else {
          setError('Curso não encontrado.');
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError('Ocorreu um erro ao carregar o curso e seus módulos.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndModules();
  }, [courseId, currentUser]);

  if (loading) {
    return <Loader title="Carregando curso..." />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Erro: {error}</div>;
  }

  return (
    <div className="course-detail-page" style={{ padding: '2rem' }}>
      {course && (
        <>
          <h1 style={{ color: 'white', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
            {course.titulo}
          </h1>
          <ModuleList modules={modules} courseId={course.id} />
        </>
      )}
    </div>
  );
};

export default CourseDetailPage;