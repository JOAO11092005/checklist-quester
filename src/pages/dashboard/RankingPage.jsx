import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FaTerminal } from 'react-icons/fa';
import { IoHardwareChipOutline, IoShieldCheckmarkOutline, IoAnalyticsOutline } from 'react-icons/io5';
import confetti from 'canvas-confetti'; 

import userAvatarPlaceholder from '../../assets/images/user-avatar.png';
import './RankingPage.css';

const RankingPage = () => {
  const { currentUser } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confete adaptado para parecer "Sparks/Dados" em branco, cinza e prata
  const fireCelebration = useCallback(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#ffffff', '#aaaaaa', '#555555']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#dddddd', '#888888', '#333333']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        const progressSnapshot = await getDocs(collection(db, 'progress'));

        const rankingDataPromises = progressSnapshot.docs.map(async (progressDoc) => {
          const userId = progressDoc.id;
          const userDocSnap = await getDoc(doc(db, 'users', userId));

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.isHiddenInRanking || userData.accessKey === 'curso2025') return null;
            
            const lessonsCount = Object.keys(progressDoc.data().lessons || {}).length;
            return {
              id: userId,
              displayName: userData.displayName || 'OP. DESCONHECIDO',
              photoURL: userData.photoURL,
              score: lessonsCount,
              xp: lessonsCount * 150,
              level: Math.floor(lessonsCount / 3) + 1
            };
          }
          return null;
        });

        const resolvedData = (await Promise.all(rankingDataPromises))
          .filter(u => u !== null && u.score > 0)
          .sort((a, b) => b.score - a.score);

        setRanking(resolvedData);
        if (resolvedData.length > 0) fireCelebration();
      } catch (err) {
        console.error("Erro ao carregar log de usuários:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [fireCelebration]);

  if (loading) return (
    <div className="star-rk-loader-container">
      <div className="star-rk-loader">
        <FaTerminal className="star-rk-loader-icon" />
        <span className="star-rk-blink-text">SINCRONIZANDO NODES DO SISTEMA...</span>
      </div>
    </div>
  );

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="star-rk-page">
      <div className="star-rk-content">
        
        {/* HERO SECTION TÉCNICA */}
        <header className="star-rk-hero">
          <div className="star-rk-live-badge">
            <span className="star-rk-dot"></span> FEED EM TEMPO REAL
          </div>
          <h1 className="star-rk-title">REGISTRO DE OPERAÇÕES</h1>
          <p className="star-rk-subtitle">Classificação de performance e extração de dados dos Desenvolvedores.</p>
        </header>

        {/* TOP 3 - ARQUITETURA DE HARDWARE */}
        <section className="star-rk-top-section">
          <div className="star-rk-top-grid">
            {topThree[1] && <TopCard user={topThree[1]} pos="second" icon={<IoHardwareChipOutline />} title="[LEAD.OP]" />}
            {topThree[0] && <TopCard user={topThree[0]} pos="first" icon={<IoShieldCheckmarkOutline />} title="[MASTER.OP]" />}
            {topThree[2] && <TopCard user={topThree[2]} pos="third" icon={<IoAnalyticsOutline />} title="[SENIOR.OP]" />}
          </div>
        </section>

        {/* REGISTRY LIST */}
        <section className="star-rk-list-section">
          <div className="star-rk-list-container">
            
            <div className="star-rk-list-header">
              <span>POS</span>
              <span>IDENTIFICAÇÃO</span>
              <span className="star-rk-hide-mobile">CAPACIDADE</span>
              <span>DATA (XP)</span>
              <span>LVL</span>
            </div>

            <div className="star-rk-list-scroll">
              {others.map((user, i) => (
                <div key={user.id} className={`star-rk-list-row ${currentUser?.uid === user.id ? 'is-me' : ''}`}>
                  <div className="star-rk-rank-num">
                    {String(i + 4).padStart(2, '0')}
                  </div>
                  
                  <div className="star-rk-user-info">
                    <div className="star-rk-avatar">
                      <img src={user.photoURL || userAvatarPlaceholder} alt="" />
                    </div>
                    <div className="star-rk-name-box">
                      <span className="star-rk-name">{user.displayName}</span>
                      {currentUser?.uid === user.id && <span className="star-rk-me-badge">VOCÊ</span>}
                    </div>
                  </div>

                  <div className="star-rk-progress star-rk-hide-mobile">
                    <div className="star-rk-bar-bg">
                      <div className="star-rk-bar-fill" style={{ width: `${Math.min(user.score * 5, 100)}%` }}></div>
                    </div>
                    <span className="star-rk-count">{String(user.score).padStart(3, '0')} Lidos</span>
                  </div>

                  <div className="star-rk-xp">
                    {user.xp.toLocaleString()} <span>PTS</span>
                  </div>

                  <div className="star-rk-lvl">
                    <span className="star-rk-lvl-text">V.{user.level}</span>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </section>
      </div>
    </div>
  );
};

const TopCard = ({ user, pos, icon, title }) => (
  <div className={`star-rk-card ${pos}`}>
    <div className="star-rk-card-inner">
      <div className="star-rk-rank-icon">{icon}</div>
      <div className="star-rk-avatar-wrapper">
        <img src={user.photoURL || userAvatarPlaceholder} alt="Operator" />
        <div className="star-rk-number-tag">{pos === 'first' ? '01' : pos === 'second' ? '02' : '03'}</div>
      </div>
      <div className="star-rk-card-info">
        <span className="star-rk-rank-title">{title}</span>
        <h3>{user.displayName}</h3>
        <div className="star-rk-stats">
          <div className="star-rk-stat-item">
            PROTOCOLOS: {user.score}
          </div>
          <div className="star-rk-xp-tag">{user.xp.toLocaleString()} XP</div>
        </div>
      </div>
    </div>
  </div>
);

export default RankingPage;