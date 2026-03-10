import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { IoRocketOutline, IoPencilOutline, IoTrashOutline, IoAddCircleOutline, IoSaveOutline, IoCubeOutline, IoListOutline } from 'react-icons/io5';

const AdminTrilhas = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ==========================================
  // ESTADOS DA TRILHA / MISSÃO
  // ==========================================
  const [formCurso, setFormCurso] = useState({
    titulo: '',
    tipo: 'FRONT-END', 
    ordem: 1, 
    imagemUrl: ''
  });
  const [editingCursoId, setEditingCursoId] = useState(null);

  // ==========================================
  // ESTADOS DOS MÓDULOS (A "RECEITA DE BOLO")
  // ==========================================
  const [modulosView, setModulosView] = useState([]);
  const [selectedCursoParaModulo, setSelectedCursoParaModulo] = useState('');
  const [formModulo, setFormModulo] = useState({ 
    titulo: '', 
    imagemUrl: '',
    ordem: 1 // <-- CRUCIAL PARA A INTELIGÊNCIA SEQUENCIAL
  });
  const [editingModuloId, setEditingModuloId] = useState(null);

  // ==========================================
  // FUNÇÕES DE TRILHA / MISSÃO
  // ==========================================
  const fetchCursos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cursos'), orderBy('ordem', 'asc'));
      const querySnapshot = await getDocs(q);
      const listaCursos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCursos(listaCursos);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleChangeCurso = (e) => {
    const { name, value } = e.target;
    setFormCurso(prev => ({ 
      ...prev, 
      [name]: name === 'ordem' ? Number(value) : value 
    }));
  };

  const handleSubmitCurso = async (e) => {
    e.preventDefault();
    try {
      if (editingCursoId) {
        await updateDoc(doc(db, 'cursos', editingCursoId), formCurso);
      } else {
        await addDoc(collection(db, 'cursos'), formCurso);
      }
      setFormCurso({ titulo: '', tipo: 'FRONT-END', ordem: 1, imagemUrl: '' });
      setEditingCursoId(null);
      fetchCursos();
    } catch (error) {
      console.error("Erro ao salvar missão:", error);
    }
  };

  const handleEditCurso = (curso) => {
    setFormCurso({
      titulo: curso.titulo || '',
      tipo: curso.tipo || 'FRONT-END',
      ordem: curso.ordem || 1,
      imagemUrl: curso.imagemUrl || ''
    });
    setEditingCursoId(curso.id);
  };

  const handleDeleteCurso = async (id) => {
    if (window.confirm("Atenção: Tem certeza que deseja abortar e excluir esta missão? Os módulos nela também ficarão inacessíveis.")) {
      try {
        await deleteDoc(doc(db, 'cursos', id));
        fetchCursos();
        if(selectedCursoParaModulo === id) {
           setSelectedCursoParaModulo('');
           setModulosView([]);
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  // ==========================================
  // FUNÇÕES DE MÓDULOS (ETAPAS)
  // ==========================================
  const fetchModulosView = async (courseId) => {
    if (!courseId) return setModulosView([]);
    try {
      // Traz os módulos ordenados para você ver exatamente a sequência que o aluno vai fazer
      const q = query(collection(db, 'cursos', courseId, 'modulos'), orderBy('ordem', 'asc'));
      const snap = await getDocs(q);
      setModulosView(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      // Fallback caso o índice do Firestore ainda não tenha sido criado
      const snap = await getDocs(collection(db, 'cursos', courseId, 'modulos'));
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModulosView(lista.sort((a,b) => (a.ordem || 0) - (b.ordem || 0)));
    }
  };

  useEffect(() => {
    fetchModulosView(selectedCursoParaModulo);
  }, [selectedCursoParaModulo]);

  const handleSubmitModulo = async (e) => {
    e.preventDefault();
    if (!selectedCursoParaModulo) return alert("Selecione uma missão para acoplar o módulo.");

    const moduloData = {
      titulo: formModulo.titulo, 
      imagemUrl: formModulo.imagemUrl,
      ordem: Number(formModulo.ordem)
    };

    try {
      if (editingModuloId) {
        await updateDoc(doc(db, 'cursos', selectedCursoParaModulo, 'modulos', editingModuloId), moduloData);
      } else {
        await addDoc(collection(db, 'cursos', selectedCursoParaModulo, 'modulos'), {
          ...moduloData, 
          criadoEm: serverTimestamp()
        });
      }
      // Prepara o formulário para o PRÓXIMO módulo automaticamente (ex: se fez o 1, sugere o 2)
      setFormModulo(prev => ({ titulo: '', imagemUrl: '', ordem: prev.ordem + 1 }));
      setEditingModuloId(null);
      fetchModulosView(selectedCursoParaModulo);
    } catch (err) { 
      alert('Erro ao gerenciar módulo'); 
    }
  };

  const handleEditModulo = (modulo) => {
    setFormModulo({
      titulo: modulo.titulo || '',
      imagemUrl: modulo.imagemUrl || '',
      ordem: modulo.ordem || 1
    });
    setEditingModuloId(modulo.id);
  };

  const handleDeleteModulo = async (moduleId) => {
    if(window.confirm("Desacoplar e apagar este módulo? Isso afetará a trilha dos alunos.")) {
      await deleteDoc(doc(db, 'cursos', selectedCursoParaModulo, 'modulos', moduleId)); 
      fetchModulosView(selectedCursoParaModulo);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2><IoRocketOutline /> Cérebro da Trilha Inteligente</h2>
        <p>Crie as Missões e defina a ordem exata dos Módulos (A Receita de Bolo) para liberar o progresso passo a passo.</p>
      </div>

      <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* ================= COLUNA DA ESQUERDA (CRIAR MISSÃO) ================= */}
        <div className="admin-column">
          <div className="admin-card form-card">
            <h3><IoRocketOutline style={{marginRight: '8px'}}/> {editingCursoId ? 'Editar Missão' : 'Nova Missão'}</h3>
            <form onSubmit={handleSubmitCurso} className="admin-form">
              <div className="form-group">
                <label>Nome da Missão (Ex: Fundamentos)</label>
                <input type="text" name="titulo" value={formCurso.titulo} onChange={handleChangeCurso} required placeholder="Digite o título..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trilha Alvo (Ex: FRONT-END)</label>
                  <input type="text" name="tipo" value={formCurso.tipo} onChange={handleChangeCurso} required style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label>Ordem Geral (Nº)</label>
                  <input type="number" name="ordem" value={formCurso.ordem} onChange={handleChangeCurso} required min="1" />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingCursoId ? <><IoSaveOutline /> Atualizar Missão</> : <><IoAddCircleOutline /> Criar Missão</>}
                </button>
                {editingCursoId && (
                  <button type="button" className="btn-secondary" onClick={() => {
                    setEditingCursoId(null);
                    setFormCurso({ titulo: '', tipo: 'FRONT-END', ordem: 1, imagemUrl: '' });
                  }}>Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ================= COLUNA DA DIREITA (SEQUÊNCIA DE MÓDULOS) ================= */}
        <div className="admin-column">
          <div className="admin-card form-card" style={{ borderLeft: '4px solid #00d2ff' }}>
            <h3><IoListOutline style={{marginRight: '8px'}}/> {editingModuloId ? 'Editar Etapa' : 'Adicionar Etapa (Módulo)'}</h3>
            <form onSubmit={handleSubmitModulo} className="admin-form">
              <div className="form-group">
                <label>Vincular à Missão:</label>
                <select 
                  value={selectedCursoParaModulo} 
                  onChange={e => {
                    setSelectedCursoParaModulo(e.target.value);
                    setEditingModuloId(null);
                    // Reseta sugerindo a etapa 1
                    setFormModulo({ titulo: '', imagemUrl: '', ordem: 1 });
                  }} 
                  required
                >
                  <option value="">-- Escolha uma missão criada --</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo} ({c.tipo})</option>)}
                </select>
              </div>

              {selectedCursoParaModulo && (
                <>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 3 }}>
                      <label>Nome do Módulo</label>
                      <input type="text" value={formModulo.titulo} onChange={e => setFormModulo({...formModulo, titulo: e.target.value})} required placeholder="Ex: Módulo 1 - Introdução" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Ordem (Passo)</label>
                      <input type="number" value={formModulo.ordem} onChange={e => setFormModulo({...formModulo, ordem: e.target.value})} required min="1" title="Define o que libera o que" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>URL da Capa do Módulo (Opcional)</label>
                    <input type="url" value={formModulo.imagemUrl} onChange={e => setFormModulo({...formModulo, imagemUrl: e.target.value})} placeholder="https://..." />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" style={{ backgroundColor: '#00d2ff', color: '#000' }}>
                      {editingModuloId ? <><IoSaveOutline /> Atualizar Etapa</> : <><IoAddCircleOutline /> Acoplar Etapa</>}
                    </button>
                    {editingModuloId && (
                      <button type="button" className="btn-secondary" onClick={() => {
                        setEditingModuloId(null);
                        setFormModulo({ titulo: '', imagemUrl: '', ordem: formModulo.ordem });
                      }}>Cancelar</button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

      </div>

      {/* ================= MAPA GERAL ================= */}
      <div className="admin-card list-card" style={{ marginTop: '20px' }}>
        <h3>Mapeamento da Trilha</h3>
        {loading ? (
          <p>Buscando arquitetura no banco de dados...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Trilha</th>
                  <th>Missão Principal</th>
                  <th>Sequência de Módulos (A Receita)</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.id} style={{ backgroundColor: selectedCursoParaModulo === curso.id ? 'rgba(0, 210, 255, 0.1)' : 'transparent' }}>
                    <td><span className="badge-ordem">{curso.ordem}</span></td>
                    <td><span className="badge-trilha">{curso.tipo}</span></td>
                    <td>
                      <strong>{curso.titulo}</strong>
                    </td>
                    <td>
                      {selectedCursoParaModulo === curso.id ? (
                        <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                          <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>Fluxo de Liberação:</span>
                          <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '10px' }}>
                            {modulosView.length === 0 ? <li style={{color: '#888'}}>Nenhuma etapa configurada.</li> : modulosView.map(m => (
                              <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px', marginBottom: '5px', borderRadius: '4px', borderLeft: '3px solid #00d2ff' }}>
                                <span><strong>Passo {m.ordem}:</strong> {m.titulo}</span>
                                <div>
                                  <button onClick={() => handleEditModulo(m)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '10px' }}><IoPencilOutline/></button>
                                  <button onClick={() => handleDeleteModulo(m.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><IoTrashOutline/></button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <button 
                          className="btn-secondary" 
                          onClick={() => setSelectedCursoParaModulo(curso.id)}
                          style={{ padding: '5px 10px', fontSize: '0.8em' }}
                        >
                          Configurar Sequência
                        </button>
                      )}
                    </td>
                    <td className="actions-cell" style={{ verticalAlign: 'top', paddingTop: '15px' }}>
                      <button className="btn-icon edit" onClick={() => handleEditCurso(curso)} title="Editar Missão"><IoPencilOutline /></button>
                      <button className="btn-icon delete" onClick={() => handleDeleteCurso(curso.id)} title="Excluir Missão"><IoTrashOutline /></button>
                    </td>
                  </tr>
                ))}
                {cursos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">Nenhuma missão configurada no sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrilhas;