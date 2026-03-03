import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Zap, Award, ChevronRight, Activity, Terminal, 
  Globe 
} from 'lucide-react';

import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalLessons: 0,
    xp: 0,
    level: 1,
    displayName: 'OPERADOR'
  });
  const [loading, setLoading] = useState(true);

  // Dados simulados para o gráfico (Telemetria)
  const chartData = [
    { name: 'Seg', xp: 400 }, { name: 'Ter', xp: 700 }, { name: 'Qua', xp: 500 },
    { name: 'Qui', xp: 900 }, { name: 'Sex', xp: 1200 }, { name: 'Sáb', xp: 800 },
    { name: 'Dom', xp: 1500 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        const progressDoc = await getDoc(doc(db, 'progress', currentUser.uid));
        const lessonsCount = progressDoc.exists() ? Object.keys(progressDoc.data().lessons || {}).length : 0;
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

        setStats({
          totalLessons: lessonsCount,
          xp: lessonsCount * 150,
          level: Math.floor(lessonsCount / 3) + 1,
          displayName: userDoc.data()?.displayName || 'OPERADOR'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  if (loading) return <div className="hub-loader">ESTABELECENDO CONEXÃO...</div>;

  return (
    <div className="hub-wrapper">
      {/* GRID DE FUNDO TÉCNICO */}
      <div className="hub-overlay"></div>

      <div className="hub-container">

        {/* HEADER DE BOAS VINDAS */}
        <header className="hub-hero">
          <div className="hero-content">
            <span className="hero-tag">STATUS: CONECTADO</span>
            <h1>OP: {stats.displayName.split(' ')[0].toUpperCase()}</h1>
            <p>Sistemas nominais. Sua rota de aprendizado está operando com eficiência máxima.</p>
          </div>
          <div className="hero-stats-quick">
            <div className="q-stat">
              <span className="q-label">TELEMETRIA (XP)</span>
              <span className="q-value">{stats.xp.toLocaleString()}</span>
            </div>
            <div className="q-stat">
              <span className="q-label">NÍVEL DE ACESSO</span>
              <span className="q-value">NVL {stats.level}</span>
            </div>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="hub-grid">

          {/* CARD DE GRÁFICO (TELEMETRIA) */}
          <div className="hub-card chart-main">
            <div className="card-header">
              <div className="header-title">
                <Activity size={20} color="#ffffff" />
                <h3>Volume de Dados Processados</h3>
              </div>
              <span className="header-sub">CICLO: 7 DIAS</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="techGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '2px', textTransform: 'uppercase' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Area 
                    type="step" /* Alterado de monotone para step para um visual mais duro/tecnológico */
                    dataKey="xp" 
                    stroke="#ffffff" 
                    strokeWidth={2} 
                    fill="url(#techGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD DE STATUS DO SISTEMA */}
          <div className="hub-card system-status">
            <div className="card-header">
              <div className="header-title">
                <Terminal size={20} color="#ffffff" />
                <h3>Parâmetros da Rota</h3>
              </div>
            </div>
            <div className="status-content">
              <div className="status-item">
                <span>Progresso Global</span>
                <div className="hub-progress-bar">
                  <div className="fill" style={{width: '65%'}}></div>
                </div>
                <small>65% CONCLUÍDO</small>
              </div>
              <div className="status-item">
                <span>Módulos Decodificados</span>
                <h4 className="v-highlight">{stats.totalLessons}</h4>
              </div>
              <button className="hub-action-btn">
                RETOMAR EXECUÇÃO <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* CARD DE CONQUISTAS RECENTES */}
          <div className="hub-card achievements">
            <div className="card-header">
              <div className="header-title">
                <Award size={20} color="#ffffff" />
                <h3>Distintivos Operacionais</h3>
              </div>
            </div>
            <div className="badge-grid">
              <div className="badge-item active" title="Alta Energia"><Zap size={20} /></div>
              <div className="badge-item active" title="Acesso Global"><Globe size={20} /></div>
              <div className="badge-item"><Award size={20} /></div>
              <div className="badge-item"><Activity size={20} /></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;