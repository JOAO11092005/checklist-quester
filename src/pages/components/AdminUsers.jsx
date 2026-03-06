import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  IoWarningOutline, 
  IoHardwareChipOutline, 
  IoCheckmarkOutline, 
  IoCloseOutline, 
  IoSaveOutline,
  IoKeyOutline
} from 'react-icons/io5';

import './AdminUsers.css'; // Importe o CSS que criaremos abaixo

const AdminUsers = () => {
  const [users, setUsers] = useState({ pending: [], active: [] });
  // Estado para controlar os inputs de Access Key individuais de cada usuário
  const [keyInputs, setKeyInputs] = useState({});

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const pendingList = []; 
      const activeList = [];
      const keysTemp = {};

      snap.forEach(doc => {
        const data = doc.data();
        keysTemp[doc.id] = data.accessKey || ''; // Salva a key atual no estado dos inputs
        
        if (data.status === "Active") {
          activeList.push({ id: doc.id, ...data });
        } else if (data.status !== "Rejected") {
          pendingList.push({ id: doc.id, ...data });
        }
      });

      setUsers({ pending: pendingList, active: activeList });
      setKeyInputs(keysTemp);
    } catch (error) { 
      console.error("Erro na telemetria:", error); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUserStatus = async (uid, status) => {
    try { 
      await updateDoc(doc(db, 'users', uid), { status }); 
      fetchUsers(); 
    } catch (error) { 
      alert("Falha de comunicação ao alterar status."); 
    }
  };

  const handleUpdateUserTrack = async (uid, newTrack) => {
    try { 
      await updateDoc(doc(db, 'users', uid), { track: newTrack }); 
      alert("Rota operacional atualizada com sucesso!"); 
      fetchUsers(); 
    } catch (error) { 
      alert("Erro ao recalcular rota do operador."); 
    }
  };

  // NOVA FUNÇÃO: Atualiza a Access Key no Firestore
  const handleUpdateAccessKey = async (uid) => {
    const newKey = keyInputs[uid];
    try {
      await updateDoc(doc(db, 'users', uid), { accessKey: newKey });
      alert(`Credencial do operador alterada para: ${newKey || 'VAZIA'}`);
      fetchUsers();
    } catch (error) {
      alert("Erro crítico ao tentar reescrever credencial.");
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      
      {/* PAINEL 1: PENDENTES (ALERTA) */}
      <div className="admin-card border-warning">
        <header className="card-header">
          <IoWarningOutline className="header-icon text-warning" />
          <h3>Acessos Pendentes</h3>
        </header>
        
        <ul className="admin-list">
          {users.pending.length === 0 ? (
            <div className="empty-state">Nenhuma anomalia no radar.</div>
          ) : users.pending.map(user => (
            <li key={user.id} className="operator-row">
              <div className="operator-info">
                <strong>{user.displayName || 'ID DESCONHECIDO'}</strong>
                <small>{user.email}</small>
              </div>
              <div className="item-actions">
                <button className="btn-save" onClick={() => handleUserStatus(user.id, 'Active')}>
                  <IoCheckmarkOutline /> AUTORIZAR
                </button>
                <button className="btn-delete" onClick={() => handleUserStatus(user.id, 'Rejected')}>
                  <IoCloseOutline /> NEGAR
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* PAINEL 2: ATIVOS (CONTROLE TOTAL) */}
      <div className="admin-card border-success">
        <header className="card-header">
          <IoHardwareChipOutline className="header-icon text-success" />
          <h3>Operadores Ativos (Controle Master)</h3>
        </header>
        <p className="card-subtitle">
          Altere a Rota (Track) ou a Credencial (Access Key) de qualquer operador.
        </p>
        
        <ul className="admin-list">
          {users.active.length === 0 ? (
            <div className="empty-state">Nenhum operador ativo.</div>
          ) : users.active.map(user => (
            <li key={user.id} className="operator-row column-layout">
              
              <div className="operator-header">
                <div className="operator-info">
                  <strong>{user.displayName || 'ID DESCONHECIDO'}</strong>
                  <small>{user.email}</small>
                </div>
                <button className="btn-danger-outline" onClick={() => handleUserStatus(user.id, 'Pending')}>
                  REVOGAR ACESSO
                </button>
              </div>
              
              {/* Painel de Controles Individuais */}
              <div className="controls-grid">
                
                {/* Controle de Rota */}
                <div className="control-panel">
                  <span className="control-label">ROTA:</span>
                  <select 
                    className="cyber-input"
                    value={user.track || ''} 
                    onChange={(e) => handleUpdateUserTrack(user.id, e.target.value)}
                  >
                    <option value="">NÃO DEFINIDA</option>
                    <option value="FRONT-END">FRONT-END</option>
                    <option value="BACK-END">BACK-END</option>
                  </select>
                </div>

                {/* Controle de Credencial (Access Key) */}
                <div className="control-panel key-panel">
                  <span className="control-label"><IoKeyOutline /> KEY:</span>
                  <input 
                    type="text"
                    className="cyber-input"
                    placeholder="Ex: Free_Tier, Admin"
                    value={keyInputs[user.id] !== undefined ? keyInputs[user.id] : ''}
                    onChange={(e) => setKeyInputs({...keyInputs, [user.id]: e.target.value})}
                  />
                  <button className="btn-update-key" onClick={() => handleUpdateAccessKey(user.id)}>
                    <IoSaveOutline />
                  </button>
                </div>

              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AdminUsers;