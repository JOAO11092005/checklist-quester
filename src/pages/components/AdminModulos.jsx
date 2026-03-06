import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { IoTrashOutline, IoPencilOutline, IoCloseOutline } from 'react-icons/io5';

const AdminModulos = () => {
  const [cursos, setCursos] = useState([]);
  const [modulosView, setModulosView] = useState([]);
  const [selectedCursoView, setSelectedCursoView] = useState('');
  const [moduloForm, setModuloForm] = useState({ courseId: '', titulo: '', imagemUrl: '' });
  const [editModule, setEditModule] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'cursos')).then(snap => {
      setCursos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const fetchModulosView = async (courseId) => {
    if (!courseId) return setModulosView([]);
    const snap = await getDocs(collection(db, 'cursos', courseId, 'modulos'));
    setModulosView(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddModulo = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'cursos', moduloForm.courseId, 'modulos'), {
        titulo: moduloForm.titulo, imagemUrl: moduloForm.imagemUrl, criadoEm: serverTimestamp()
      });
      alert('Módulo adicionado!');
      if (selectedCursoView === moduloForm.courseId) fetchModulosView(moduloForm.courseId);
      setModuloForm({ ...moduloForm, titulo: '', imagemUrl: '' });
    } catch (err) { alert('Erro ao adicionar módulo'); }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'cursos', selectedCursoView, 'modulos', editModule.id), {
        titulo: editModule.titulo, imagemUrl: editModule.imagemUrl
      });
      alert("Módulo atualizado!"); setEditModule(null); fetchModulosView(selectedCursoView);
    } catch (error) { alert("Erro ao atualizar"); }
  };

  const handleDeleteModulo = async (courseId, moduleId) => {
    if(window.confirm("Apagar módulo?")) {
      await deleteDoc(doc(db, 'cursos', courseId, 'modulos', moduleId)); fetchModulosView(courseId);
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-card">
        <h3>Acoplar Módulo à Trilha</h3>
        <form onSubmit={handleAddModulo}>
          <select value={moduloForm.courseId} onChange={e => setModuloForm({...moduloForm, courseId: e.target.value})} required>
            <option value="">Selecione a Trilha...</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo} ({c.tipo})</option>)}
          </select>
          <input type="text" placeholder="Nome do Módulo" value={moduloForm.titulo} onChange={e => setModuloForm({...moduloForm, titulo: e.target.value})} required />
          <input type="url" placeholder="URL da Imagem do Módulo (Opcional)" value={moduloForm.imagemUrl} onChange={e => setModuloForm({...moduloForm, imagemUrl: e.target.value})} />
          <button type="submit" className="btn-save">Gravar Módulo</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Módulos Ativos</h3>
        <select className="filter-select" value={selectedCursoView} onChange={(e) => { setSelectedCursoView(e.target.value); fetchModulosView(e.target.value); }}>
          <option value="">Filtrar por Trilha...</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
        
        <ul className="admin-list" style={{marginTop: '15px'}}>
          {modulosView.length === 0 ? <p style={{color:'#555'}}>Nenhum módulo selecionado.</p> : modulosView.map(m => (
            <li key={m.id}>
              <span>{m.titulo}</span>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => setEditModule(m)}><IoPencilOutline /></button>
                <button className="btn-delete" onClick={() => handleDeleteModulo(selectedCursoView, m.id)}><IoTrashOutline /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editModule && (
        <div className="modal-overlay">
          <div className="admin-card modal-content">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <h3>Editar Módulo</h3>
              <button onClick={() => setEditModule(null)} className="btn-close"><IoCloseOutline size={24}/></button>
            </div>
            <form onSubmit={handleUpdateModule}>
              <input type="text" value={editModule.titulo} onChange={e => setEditModule({...editModule, titulo: e.target.value})} required />
              <input type="url" value={editModule.imagemUrl} onChange={e => setEditModule({...editModule, imagemUrl: e.target.value})} />
              <button type="submit" className="btn-save">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
export default AdminModulos;