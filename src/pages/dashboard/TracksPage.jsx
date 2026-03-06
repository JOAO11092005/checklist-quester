
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams, Navigate } from 'react-router-dom';
import { 
  IoRocketOutline, IoCheckmarkCircle, IoLockClosed, 
  IoTerminalOutline, IoHardwareChipOutline, IoMedalOutline,
  IoPlanetOutline, IoEarthOutline, IoEyeOutline 
} from 'react-icons/io5';
import Loader from '../../components/common/Loader';
import './TracksPage.css';

// Lista de administradores
const ADMIN_EMAILS = [
  "joao@gmail.com",
  "joaopaulonevesbatista@gmail.com",
  "joaopaulonevesbatista20@gmail.com"
];

const TracksPage = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams(); // Pega o ID do usuário da URL, se existir
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState('CADETE (INICIANTE)');
  const [userXP, setUserXP] = useState(0);
  const [userTrack, setUserTrack] = useState('FRONT-END'); 
  const [roadmap, setRoadmap] = useState([]);
  const [viewingUser, setViewingUser] = useState(null); // Armazena dados do usuário visualizado

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const targetUserId = isAdmin && userId ? userId : currentUser?.uid;

  // Redireciona se um não-admin tentar ver a trilha de outro
  if (!isAdmin && userId && userId !== currentUser?.uid) {
    return <Navigate to="/trilhas" replace />;
  }

  useEffect(() => {
    const fetchRoadmapAndProgress = async () => {
      if (!targetUserId) return;
      setLoading(true);

      try {
        // Busca os dados do usuário que está sendo visualizado
        const viewingUserRef = doc(db, 'users', targetUserId);
        const viewingUserSnap = await getDoc(viewingUserRef);
        if (viewingUserSnap.exists()) {
          setViewingUser(viewingUserSnap.data());
        }

        const progressRef = doc(db, 'progress', targetUserId);
        const progressSnap = await getDoc(progressRef);
        const pData = progressSnap.exists() ? progressSnap.data() : {};
        const completedLessons = pData.lessons || {};

        const lessonsCount = Object.keys(completedLessons).filter(k => completedLessons[k] === true).length;
        const xp = lessonsCount * 150;
        setUserXP(xp);

        // Lógica de Rank
        if (xp < 1500) setUserRank('CADETE (INICIANTE)');
        else if (xp < 5000) setUserRank('DESENVOLVEDOR JÚNIOR');
        else if (xp < 12000) setUserRank('DESENVOLVEDOR PLENO');
        else if (xp < 25000) setUserRank('DESENVOLVEDOR SÊNIOR');
        else setUserRank('ARQUITETO DE SOFTWARE');

        let currentTrack = 'FRONT-END';
        if (viewingUserSnap.exists() && viewingUserSnap.data().track) {
          currentTrack = viewingUserSnap.data().track.toUpperCase();
        }
        setUserTrack(currentTrack);

        const q = query(collection(db, 'cursos'), where('tipo', '==', currentTrack));
        const coursesSnap = await getDocs(q);
        let trackData = [];

        for (const courseDoc of coursesSnap.docs) {
          const courseInfo = { id: courseDoc.id, ...courseDoc.data() };
          const modulesSnap = await getDocs(collection(db, 'cursos', courseDoc.id, 'modulos'));
          const modulesList = modulesSnap.docs.map(m => ({ id: m.id, ...m.data() }));
          trackData.push({ ...courseInfo, modules: modulesList });
        }

        trackData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        setRoadmap(trackData);

      } catch (error) {
        console.error("Erro ao carregar telemetria:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapAndProgress();
  }, [targetUserId]);

  if (loading) return <Loader title="CALCULANDO ROTA ORBITAL..." />;

  let tempGlobalIndex = 0;
  const processedRoadmap = roadmap.map(course => {
    return {
      ...course,
      modules: course.modules.map(mod => {
        tempGlobalIndex++;
        return {
          ...mod,
          globalIndex: tempGlobalIndex,
          requiredXP: (tempGlobalIndex - 1) * 500,
          completionXP: tempGlobalIndex * 500
        };
      })
    };
  });

  const reversedRoadmap = [...processedRoadmap].reverse();

  return (
    <div className="star-track-container">
      <div className="star-track-stars"></div>

      {/* --- ADMIN VIEW HEADER --- */}
      {isAdmin && viewingUser && (
        <div className="admin-view-header">
          <IoEyeOutline /> Você está visualizando a trilha de: <span className="admin-view-email">{viewingUser.email}</span>
        </div>
      )}

      {/* --- DASHBOARD HEADER --- */}
      <div className="star-track-header">
        <div className="track-header-content">
          <div className="track-user-info">
            <div className="track-icon-wrapper">
              <IoTerminalOutline size={32} color="#00d2ff" />
            </div>
            <div>
              <h1 className="track-title">TRILHA: {userTrack}</h1>
              <p className="track-subtitle">PLANO DE CARREIRA E DESENVOLVIMENTO</p>
            </div>
          </div>
          <div className="track-stats-panel">
            <div className="stat-box">
              <span className="stat-label">PATENTE ATUAL</span>
              <span className="stat-value rank-value"><IoMedalOutline style={{ marginRight: '5px' }}/> {userRank}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">TELEMETRIA (XP)</span>
              <span className="stat-value xp-value">{userXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- ROADMAP --- */}
      <div className="roadmap-super-container">
        <div className="space-station-top">
          <IoPlanetOutline className="satellite-icon" />
          <h2>ESTAÇÃO ORBITAL SÊNIOR</h2>
          <p>Seu objetivo final</p>
        </div>

        <div className="roadmap-timeline">
          <div className="timeline-center-line"></div>
          {reversedRoadmap.length === 0 ? (
            <div className="empty-track">NENHUMA ROTA ENCONTRADA PARA ESTA TRILHA.</div>
          ) : (
            reversedRoadmap.map((course, index) => {
              const courseDisplayIndex = roadmap.length - index;
              const reversedModules = [...course.modules].reverse();
              return (
                <div key={course.id} className="course-section">
                  <div className="course-milestone-center">
                    <div className="milestone-badge">
                      <IoRocketOutline size={20} />
                      MISSÃO {courseDisplayIndex}: {course.titulo}
                    </div>
                  </div>
                  <div className="modules-grid-centered">
                    {reversedModules.map((mod) => {
                      const isCompleted = userXP >= mod.completionXP;
                      const isActive = userXP >= mod.requiredXP && userXP < mod.completionXP;
                      return (
                        <div key={mod.id} className={`timeline-node ${isCompleted ? 'completed' : isActive ? 'active' : 'locked'}`}>
                          <div className="node-connector-dot">
                            {isCompleted ? <IoCheckmarkCircle /> : isActive ? <IoHardwareChipOutline /> : <IoLockClosed />}
                          </div>
                          <div className="node-card">
                            <img src={mod.imagemUrl || 'https://via.placeholder.com/300x150'} alt={mod.titulo} className="node-image" />
                            <div className="node-content">
                              <span className="node-badge">MÓDULO {mod.globalIndex}</span>
                              <h3 className="node-title">{mod.titulo}</h3>
                              {isCompleted ? (
                                <span className="node-status text-completed">CONCLUÍDO</span>
                              ) : isActive ? (
                                <Link to={`/cursos/${course.id}/modulos/${mod.id}`} className="node-btn-acessar">
                                  ACESSAR MÓDULO
                                </Link>
                              ) : (
                                <span className="node-status text-locked">REQUER {mod.requiredXP} XP</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="earth-base-bottom">
          <div className="earth-glow"></div>
          <IoEarthOutline className="earth-icon" />
          <h2>BASE TERRESTRE</h2>
          <p>Ponto de Partida</p>
        </div>
      </div>
    </div>
  );
};

export default TracksPage;
