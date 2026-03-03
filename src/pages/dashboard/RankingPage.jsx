import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FaCrown, FaTrophy, FaRocket, FaBolt, FaStar, FaFire, FaTerminal } from 'react-icons/fa';
import confetti from 'canvas-confetti'; // Certifique-se de ter instalado: npm install canvas-confetti

import userAvatarPlaceholder from '../../assets/images/user-avatar.png';
import './RankingPage.css';

const RankingPage = () => {
  const { currentUser } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const fireCelebration = useCallback(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#8257e5', '#04d361']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#ff008e', '#8257e5']
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
              displayName: userData.displayName || 'Dev Explorer',
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
        console.error("Erro ao carregar ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [fireCelebration]);

  if (loading) return (
    <div className="ranking-loader-container">
      <div className="cyber-loader">
        <FaTerminal className="loader-icon" />
        <div className="loader-bar"></div>
        <span>SINCRONIZANDO NODES...</span>
      </div>
    </div>
  );

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="ranking-page-v3">
      <div className="bg-elements">
        <div className="glow-orb purple"></div>
        <div className="glow-orb blue"></div>
      </div>

      <div className="ranking-content">
        <header className="ranking-hero">
          <div className="badge-live"><span className="dot"></span> LIVE UPDATES</div>
          <h1 className="title-gradient">HALL DA FAMA</h1>
          <p>Os arquitetos do futuro que estão dominando o código.</p>
        </header>

        {/* PODIUM SECTION */}
        <section className="podium-section">
          <div className="podium-grid">
            {topThree[1] && <PodiumCard user={topThree[1]} pos="second" icon={<FaTrophy />} title="Prodigy" />}
            {topThree[0] && <PodiumCard user={topThree[0]} pos="first" icon={<FaCrown />} title="Legendary" />}
            {topThree[2] && <PodiumCard user={topThree[2]} pos="third" icon={<FaStar />} title="Elite" />}
          </div>
        </section>

        {/* LIST SECTION */}
        <section className="list-section">
          <div className="list-container">
            <div className="list-header-grid">
              <span>RANK</span>
              <span>DEVELOPER</span>
              <span className="hide-mobile">PROGRESSO</span>
              <span>XP</span>
              <span>LVL</span>
            </div>

            <div className="list-scroll">
              {others.map((user, i) => (
                <div key={user.id} className={`list-row-card ${currentUser?.uid === user.id ? 'is-me' : ''}`}>
                  <div className="user-rank">#{i + 4}</div>
                  
                  <div className="user-info">
                    <div className="avatar-frame">
                      <img src={user.photoURL || userAvatarPlaceholder} alt="" />
                    </div>
                    <div className="name-box">
                      <span className="name">{user.displayName}</span>
                      {currentUser?.uid === user.id && <span className="me-badge">VOCÊ</span>}
                    </div>
                  </div>

                  <div className="user-progress hide-mobile">
                    <div className="mini-bar-bg">
                      <div className="mini-bar-fill" style={{ width: `${Math.min(user.score * 5, 100)}%` }}></div>
                    </div>
                    <span className="count">{user.score} aulas</span>
                  </div>

                  <div className="user-xp">
                    <FaFire className="xp-icon" />
                    {user.xp.toLocaleString()}
                  </div>

                  <div className="user-lvl">
                    <span className="lvl-text">{user.level}</span>
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

const PodiumCard = ({ user, pos, icon, title }) => (
  <div className={`podium-card ${pos}`}>
    <div className="card-inner">
      <div className="rank-icon">{icon}</div>
      <div className="avatar-wrapper">
        <div className="avatar-ring-test"></div>
        <img src={user.photoURL || userAvatarPlaceholder} alt="" />
        <div className="number-tag">{pos === 'first' ? '1' : pos === 'second' ? '2' : '3'}</div>
      </div>
      <div className="info">
        <span className="rank-title">{title}</span>
        <h3>{user.displayName}</h3>
        <div className="stats">
          <div className="stat-item">
            <FaBolt /> {user.score} Aulas
          </div>
          <div className="xp-tag">{user.xp.toLocaleString()} XP</div>
        </div>
      </div>
    </div>
  </div>
);

export default RankingPage;