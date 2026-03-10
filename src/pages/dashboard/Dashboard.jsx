import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Terminal, Shield, Activity, Code, Database, Layout, Cpu, 
  Globe, Wifi, PlayCircle, Star, Hexagon, TrendingUp, TrendingDown,
  Satellite, ServerCrash, Radio, Zap, Calendar
} from 'lucide-react';

import './Dashboard.css';

// BANCO DE DADOS DE MEDALHAS: Estética Orbital & Dev
const BADGES_DATABASE = [
  { id: 1, name: 'Ignition Node', desc: 'Sistemas online. Primeiro login detectado.', icon: Zap, rarity: 'common', reqLessons: 0 },
  { id: 2, name: 'Hello World', desc: 'Primeira instrução compilada com sucesso.', icon: Code, rarity: 'common', reqLessons: 1 },
  { id: 3, name: 'Trainee Orbital', desc: 'Uplink de 1.500 XP atingido.', icon: Satellite, rarity: 'rare', reqXP: 1500 },
  { id: 4, name: 'DOM Architect', desc: 'Construiu 5 estruturas de Front-End.', icon: Layout, rarity: 'epic', reqLessons: 5 },
  { id: 5, name: 'Dev Júnior', desc: 'Uplink de 5.000 XP atingido.', icon: Shield, rarity: 'rare', reqXP: 5000 },
  { id: 6, name: 'Streaming Protocol', desc: '10 módulos de vídeo decodificados.', icon: PlayCircle, rarity: 'epic', reqLessons: 10 },
  { id: 7, name: 'DB Link', desc: '15 módulos. Conexão com banco de dados estável.', icon: Database, rarity: 'common', reqLessons: 15 },
  { id: 8, name: 'Dev Pleno', desc: 'Uplink de 12.000 XP atingido.', icon: Hexagon, rarity: 'legendary', reqXP: 12000 },
  { id: 9, name: 'Cloud Deploy', desc: '25 módulos. Aplicação no ar.', icon: Globe, rarity: 'rare', reqLessons: 25 },
  { id: 10, name: 'Core Logic', desc: '30 módulos processados na CPU.', icon: Cpu, rarity: 'rare', reqLessons: 30 },
  { id: 11, name: 'Bug Hunter', desc: 'Sobreviveu a 35 módulos de compilação.', icon: Activity, rarity: 'common', reqLessons: 35 },
  { id: 12, name: 'Dev Sênior', desc: 'Uplink de 25.000 XP atingido.', icon: Star, rarity: 'mythic', reqXP: 25000 },
  { id: 30, name: 'Full-Stack Orbit', desc: 'Cobertura total do sistema. Trilhas completas.', icon: ServerCrash, rarity: 'mythic', reqLessons: 150 },
];

const diasAbreviados = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const diasDaSemana = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    xp: 0,
    rank: 'CONVIDADO (MODO DE SEGURANÇA)',
    displayName: 'CARREGANDO...',
    dayOfWeek: 'CARREGANDO...',
    trend: 'up',
    badges: []
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Busca paralela no Back-end (Firebase)
        const [userDoc, progressDoc] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDoc(doc(db, 'progress', currentUser.uid))
        ]);

        const completedLessonsCount = progressDoc.exists() ? Object.keys(progressDoc.data().lessons || {}).length : 0;
        const currentXP = completedLessonsCount * 150; 
        
        // Algoritmo de Patentes
        let rank = 'CADETE ORBITAL';
        if (currentXP >= 25000) rank = 'ARQUITETO DE REDE (SENIOR)';
        else if (currentXP >= 12000) rank = 'ENGENHEIRO DE SOFTWARE (PLENO)';
        else if (currentXP >= 5000) rank = 'DESENVOLVEDOR (JÚNIOR)';

        // Motor de Conquistas
        const unlockedBadges = BADGES_DATABASE.map(badge => {
          let isUnlocked = false;
          if (badge.reqLessons !== undefined && completedLessonsCount >= badge.reqLessons) isUnlocked = true;
          if (badge.reqXP !== undefined && currentXP >= badge.reqXP) isUnlocked = true;
          return { ...badge, unlocked: isUnlocked };
        });

        // Lógica de Datas e Simulação de Tráfego de Rede
        const hojeData = new Date();
        const hojeIndex = hojeData.getDay();
        const diaAtualExtenso = diasDaSemana[hojeIndex];

        let weekData = [];
        let previousXP = 0;
        let todayXP = currentXP > 0 ? currentXP / 7 : 0;

        for (let i = 0; i <= hojeIndex; i++) {
          let simulatedDayXP = Math.floor(Math.random() * 300) + 100;
          if (i === hojeIndex) todayXP = simulatedDayXP;
          else if (i === hojeIndex - 1) previousXP = simulatedDayXP;
          weekData.push({ name: diasAbreviados[i], xp: simulatedDayXP });
        }
        for (let i = hojeIndex + 1; i < 7; i++) {
          weekData.push({ name: diasAbreviados[i], xp: 0 });
        }

        setStats({
          totalLessons: completedLessonsCount,
          xp: currentXP,
          rank: rank,
          displayName: userDoc.exists() && userDoc.data().displayName ? userDoc.data().displayName : 'Viajante Local',
          dayOfWeek: diaAtualExtenso,
          trend: todayXP >= previousXP ? 'up' : 'down',
          badges: unlockedBadges
        });
        setChartData(weekData);

      } catch (err) {
        console.error("Falha no Uplink:", err);
        setError("Não foi possível estabelecer conexão com o banco de dados principal.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) return (
    <div className="system-loader">
      <Satellite size={48} className="spin-slow pulse-cyan" />
      <p>ESTABELECENDO UPLINK COM SERVIDORES...</p>
    </div>
  );

  if (error) return (
    <div className="system-error">
      <ServerCrash size={48} color="#ff3333" />
      <p>ERRO CRÍTICO: {error}</p>
    </div>
  );

  const unlockedCount = stats.badges.filter(b => b.unlocked).length;

  return (
    <div className="starlink-terminal">
      {/* CABEÇALHO DO TERMINAL */}
      <header className="terminal-header">
        <div className="header-brand">
          <Radio size={32} className="pulse-cyan" />
          <div>
            <h1>PAINEL DE COMANDO DEV // STATUS: <span className="status-ok">ONLINE</span></h1>
            <div className="local-time">
              <Calendar size={14} /> CICLO LOCAL: {stats.dayOfWeek}
            </div>
          </div>
        </div>
        <div className="user-identification">
          <p className="user-id">ID: {stats.displayName.toUpperCase()}</p>
          <p className="user-rank">{stats.rank}</p>
        </div>
      </header>

      {/* MÉTRICAS DE TELEMETRIA */}
      <section className="telemetry-grid">
        <div className="telemetry-card">
          <span className="t-label">UPLINK TOTAL (XP)</span>
          <span className="t-value cyan-glow">{stats.xp.toLocaleString()} <span className="t-unit">KB/s</span></span>
        </div>
        <div className="telemetry-card">
          <span className="t-label">MÓDULOS DECODIFICADOS</span>
          <span className="t-value">{stats.totalLessons}</span>
        </div>
        <div className="telemetry-card">
          <span className="t-label">TENDÊNCIA DE TRÁFEGO</span>
          <span className={`t-value flex-align ${stats.trend === 'up' ? 'text-green' : 'text-red'}`}>
            {stats.trend === 'up' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            {stats.trend === 'up' ? 'OTIMIZADO' : 'DEGRADADO'}
          </span>
        </div>
        <div className="telemetry-card">
          <span className="t-label">LATÊNCIA DE CONEXÃO</span>
          <span className="t-value text-green">14 <span className="t-unit">ms</span></span>
        </div>
      </section>

      {/* ÁREA PRINCIPAL: GRÁFICO E ARSENAL */}
      <div className="main-grid">
        {/* GRÁFICO DE ATIVIDADE */}
        <div className="glass-panel chart-panel">
          <div className="panel-title">
            <Activity size={18} />
            <h2>SINAL DE FREQUÊNCIA DE ESTUDO</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1c23" vertical={false} />
                <XAxis dataKey="name" stroke="#4a5568" tick={{ fill: '#a0aec0', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#4a5568" tick={{ fill: '#a0aec0', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(5, 5, 5, 0.9)', border: '1px solid #00e5ff', borderRadius: '0', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00e5ff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#00e5ff" strokeWidth={2} fill="url(#cyanGradient)" activeDot={{ r: 6, fill: '#fff', stroke: '#00e5ff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GALERIA DE CONQUISTAS */}
        <div className="glass-panel achievements-panel">
          <div className="panel-title">
            <Terminal size={18} />
            <h2>ARSENAL DE SISTEMA ({unlockedCount}/{BADGES_DATABASE.length})</h2>
          </div>
          
          <div className="progress-track">
            <div className="progress-bar-bg">
              <div className="progress-fill" style={{width: `${(unlockedCount / BADGES_DATABASE.length) * 100}%`}}></div>
            </div>
          </div>

          <div className="badges-grid">
            {stats.badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className={`badge-node ${badge.unlocked ? 'online ' + badge.rarity : 'offline'}`}>
                  <div className="node-icon">
                    <Icon size={20} />
                  </div>
                  <div className="node-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.desc}</p>
                    <span className="node-status">
                      {badge.unlocked ? '> ATIVADO' : badge.reqXP ? `> REQ: ${badge.reqXP} XP` : `> REQ: ${badge.reqLessons} MÓDULOS`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;