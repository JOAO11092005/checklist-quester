import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams, Navigate } from 'react-router-dom';
import { 
  IoRocketOutline, IoCheckmarkCircle, IoLockClosed, 
  IoHardwareChipOutline, IoMedalOutline, IoChevronBack, IoChevronForward,
  IoEyeOutline, IoEarthOutline, IoPlanetOutline, IoServerOutline, IoSyncOutline,
  IoScanOutline
} from 'react-icons/io5';
import Loader from '../../components/common/Loader';
import './TracksPage.css';

const ADMIN_EMAILS = [
  "joao@gmail.com",
  "joaopaulonevesbatista@gmail.com",
  "joaopaulonevesbatista20@gmail.com"
];

const TracksPage = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  
  const [userRank, setUserRank] = useState('CADETE (INICIANTE)');
  const [userXP, setUserXP] = useState(0);
  const [missions, setMissions] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [viewingUser, setViewingUser] = useState(null);

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  const targetUserId = isAdmin && userId ? userId : currentUser?.uid;

  const xpAccumulator = useRef(0);
  const indexAccumulator = useRef(0);

  if (!isAdmin && userId && userId !== currentUser?.uid) {
    return <Navigate to="/trilhas" replace />;
  }

  useEffect(() => {
    let isMounted = true;

    const fetchProgressively = async () => {
      if (!targetUserId) return;
      
      try {
        const [viewingUserSnap, progressSnap, coursesSnap] = await Promise.all([
          getDoc(doc(db, 'users', targetUserId)),
          getDoc(doc(db, 'progress', targetUserId)),
          getDocs(collection(db, 'cursos'))
        ]);

        if (viewingUserSnap.exists() && isMounted) {
          setViewingUser(viewingUserSnap.data());
        }

        const completedLessons = progressSnap.exists() ? progressSnap.data().lessons || {} : {};

        let trackData = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        trackData.sort((a, b) => {
          const typeA = (a.tipo || '').toUpperCase();
          const typeB = (b.tipo || '').toUpperCase();
          const weightA = typeA.includes('FRONT') ? 1 : typeA.includes('BACK') ? 2 : 3;
          const weightB = typeB.includes('FRONT') ? 1 : typeB.includes('BACK') ? 2 : 3;
          if (weightA !== weightB) return weightA - weightB;
          return (a.ordem || 0) - (b.ordem || 0);
        });

        let loadedMissions = [];
        xpAccumulator.current = 0;
        indexAccumulator.current = 0;

        for (let i = 0; i < trackData.length; i++) {
          const course = trackData[i];
          const isBackend = (course.tipo || '').toUpperCase().includes('BACK');
          
          const modulesSnap = await getDocs(collection(db, 'cursos', course.id, 'modulos'));
          let modulesData = modulesSnap.docs.map(m => ({ id: m.id, ...m.data() }));
          modulesData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

          const processedModules = await Promise.all(
            modulesData.map(async (mod) => {
              const aulasSnap = await getDocs(collection(db, 'cursos', course.id, 'modulos', mod.id, 'aulas'));
              const totalAulas = aulasSnap.docs.length;
              let aulasConcluidasNoModulo = 0;
              
              aulasSnap.docs.forEach(a => {
                if (completedLessons[a.id]) aulasConcluidasNoModulo++;
              });
              
              const isModuleCompleted = totalAulas > 0 && aulasConcluidasNoModulo >= totalAulas;
              return { ...mod, totalAulas, isModuleCompleted };
            })
          );

          processedModules.forEach(mod => {
            indexAccumulator.current++;
            if (mod.isModuleCompleted) xpAccumulator.current += 500;
            
            loadedMissions.push({
              ...mod,
              courseId: course.id,
              courseTitle: course.titulo,
              isBackend,
              globalIndex: indexAccumulator.current,
              requiredXP: (indexAccumulator.current - 1) * 500,
              completionXP: indexAccumulator.current * 500
            });
          });

          if (isMounted) {
            setMissions([...loadedMissions]); 
            setUserXP(xpAccumulator.current);
            
            const currentXP = xpAccumulator.current;
            if (currentXP < 1500) setUserRank('CADETE (INICIANTE)');
            else if (currentXP < 5000) setUserRank('DESENVOLVEDOR JÚNIOR');
            else if (currentXP < 12000) setUserRank('DESENVOLVEDOR PLENO');
            else if (currentXP < 25000) setUserRank('DESENVOLVEDOR SÊNIOR');
            else setUserRank('ARQUITETO DE SOFTWARE (FULL-STACK)');

            if (i === 0) {
              setInitialLoading(false);
              if (trackData.length > 1) setBackgroundLoading(true); 
            }
          }
        } 

        if (isMounted) setBackgroundLoading(false);

      } catch (error) {
        console.error("Erro ao carregar telemetria:", error);
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchProgressively();

    return () => { isMounted = false; };
  }, [targetUserId]);

  const nextSlide = () => {
    if (currentSlide < missions.length) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  if (initialLoading) return <Loader title="INICIANDO SISTEMAS VITAIS..." />;

  const isFinalPlatform = currentSlide === missions.length && !backgroundLoading;

  return (
    <div className="sci-fi-theme-container">
      {/* BACKGROUND EFFECTS */}
      <div className="space-bg-layer"></div>
      <div className="planet-bg-layer"></div>

      {isAdmin && viewingUser && (
        <div className="admin-telemetry-bar">
          <IoEyeOutline /> TELEMETRIA: <span>{viewingUser.email}</span>
        </div>
      )}

      {/* HEADER DA MISSÃO */}
      <header className="mission-header">
        <div className="mission-title-area">
          <div className="tech-radar-icon">
            <IoScanOutline className="scan-spin" />
          </div>
          <div>
            <h1>DIÁRIO DE BORDO: FULL-STACK</h1>
            <p>SISTEMA DE PROGRESSÃO ORBITAL 
              {backgroundLoading && (
                <span className="background-loader-badge">
                  <IoSyncOutline className="spin-icon" /> SINCRONIZANDO
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mission-stats-area">
          <div className="stat-card rank-card">
            <span className="stat-label">PATENTE</span>
            <span className="stat-value"><IoMedalOutline /> {userRank}</span>
          </div>
          <div className="stat-card xp-card">
            <span className="stat-label">ENERGIA (XP)</span>
            <span className="stat-value">{userXP.toLocaleString()} XP</span>
          </div>
        </div>
      </header>

      {/* CARROSSEL HERO DE MISSÕES */}
      <div className="hero-carousel-wrapper">
        <button 
          className={`carousel-btn prev-btn ${currentSlide === 0 ? 'disabled' : ''}`} 
          onClick={prevSlide} disabled={currentSlide === 0}
        >
          <IoChevronBack />
        </button>

        <div className="carousel-viewport">
          <div 
            className="carousel-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {missions.map((mission, index) => {
              const isUnlocked = userXP >= mission.requiredXP;
              const isCompleted = mission.isModuleCompleted;
              const isActive = isUnlocked && !isCompleted;

              return (
                <div className="carousel-slide" key={mission.id}>
                  <div className={`sci-fi-panel ${isCompleted ? 'completed' : isActive ? 'active' : 'locked'}`}>
                    
                    <div className="panel-image-section">
                      <div className="hologram-overlay"></div>
                      <img src={mission.imagemUrl || 'https://via.placeholder.com/800x400'} alt={mission.titulo} />
                      <div className="mission-badge">
                        MISSÃO {mission.globalIndex}: {mission.isBackend ? 'BACK-END' : 'FRONT-END'}
                      </div>
                      <div className="status-circle">
                        {isCompleted ? <IoCheckmarkCircle /> : isActive ? <IoRocketOutline /> : <IoLockClosed />}
                      </div>
                    </div>

                    <div className="panel-content-section">
                      <div className="tech-decor-line"></div>
                      <h2 className="mission-course-title">
                        {mission.isBackend ? <IoServerOutline/> : <IoHardwareChipOutline/>} {mission.courseTitle}
                      </h2>
                      <h3 className="mission-module-title">{mission.titulo}</h3>
                      
                      <div className="mission-action-area">
                        {isCompleted ? (
                          <div className="btn-sci-fi btn-success">
                            MISSÃO CONCLUÍDA ({mission.totalAulas} AULAS)
                          </div>
                        ) : isActive ? (
                          <Link to={`/cursos/${mission.courseId}/modulos/${mission.id}`} className="btn-sci-fi btn-launch">
                            INICIAR MISSÃO
                          </Link>
                        ) : (
                          <div className="btn-sci-fi btn-locked">
                            SISTEMA BLOQUEADO (REQUER {mission.requiredXP} XP)
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* SLIDE FINAL */}
            {!backgroundLoading && (
              <div className="carousel-slide">
                 <div className="sci-fi-panel final-platform">
                    <div className="final-platform-content">
                      <div className="hologram-ring">
                        <IoPlanetOutline className="huge-planet-icon" />
                      </div>
                      <h2>ESTAÇÃO ORBITAL ALCANÇADA</h2>
                      <p>Sequência de treinamento Full-Stack finalizada com sucesso. Status: Operacional.</p>
                      <div className="final-stats">
                        <span>XP TOTAL: {userXP}</span>
                        <span className="divisor">|</span>
                        <span>PATENTE: {userRank}</span>
                      </div>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>

        <button 
          className={`carousel-btn next-btn ${isFinalPlatform ? 'disabled' : ''}`} 
          onClick={nextSlide} disabled={isFinalPlatform || (currentSlide === missions.length - 1 && backgroundLoading)}
        >
          <IoChevronForward />
        </button>
      </div>
      
      {/* LINHA DO TEMPO ORBITAL (BOTTOM) */}
      <div className="orbital-timeline">
        {missions.map((mission, idx) => {
           const isUnlocked = userXP >= mission.requiredXP;
           const isCompleted = mission.isModuleCompleted;
           return (
            <React.Fragment key={idx}>
              <div 
                className={`timeline-node ${currentSlide === idx ? 'current' : ''} ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                title={mission.titulo}
              >
                <div className="node-core"></div>
              </div>
              {/* Conector entre os nós */}
              <div className={`timeline-connector ${isCompleted ? 'completed' : ''}`}></div>
            </React.Fragment>
          )
        })}
        {/* Nó final da estação */}
        {!backgroundLoading && (
          <div 
            className={`timeline-node final-node ${currentSlide === missions.length ? 'current' : ''}`}
            onClick={() => setCurrentSlide(missions.length)}
            title="Estação Orbital"
          >
            <div className="node-core"></div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TracksPage;