import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { IoTrashOutline, IoPencilOutline, IoCloseOutline } from 'react-icons/io5';

const AdminAulas = () => {
  const [cursos, setCursos] = useState([]);
  const [aulasView, setAulasView] = useState([]);
  const [modulosViewSelect, setModulosViewSelect] = useState([]);
  
  const [selectedCursoView, setSelectedCursoView] = useState('');
  const [selectedModuloView, setSelectedModuloView] = useState('');

  const [aulaForm, setAulaForm] = useState({ courseId: '', moduleId: '', titulo: '', iframeUrl: '', descricao: '' });
  const [formModulosOptions, setFormModulosOptions] = useState([]);
  const [editLesson, setEditLesson] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'cursos')).then(snap => setCursos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  // Busca módulos quando escolhe trilha no formulário
  useEffect(() => {
    if (aulaForm.courseId) {
      getDocs(collection(db, 'cursos', aulaForm.courseId, 'modulos')).then(snap => setFormModulosOptions(snap.docs.map(d => ({ id: d.id, ...d.data()}))));
    } else { setFormModulosOptions([]); }
  }, [aulaForm.courseId]);

  // Busca módulos para o filtro de visualização
  const fetchModulosForView = async (courseId) => {
    if (!courseId) return setModulosViewSelect([]);
    const snap = await getDocs(collection(db, 'cursos', courseId, 'modulos'));
    setModulosViewSelect(snap.docs.map(d => ({ id: d.id, ...d.data()})));
  };

  const fetchAulasView = async (courseId, moduleId) => {
    if (!courseId || !moduleId) return setAulasView([]);
    const snap = await getDocs(collection(db, 'cursos', courseId, 'modulos', moduleId, 'aulas'));
    setAulasView(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddAula = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'cursos', aulaForm.courseId, 'modulos', aulaForm.moduleId, 'aulas'), {
        titulo: aulaForm.titulo, iframeUrl: aulaForm.iframeUrl, descricao: aulaForm.descricao, criadoEm: serverTimestamp()
      });
      alert('Transmissão adicionada!');
      if (selectedCursoView === aulaForm.courseId && selectedModuloView === aulaForm.moduleId) fetchAulasView(aulaForm.courseId, aulaForm.moduleId);
      setAulaForm({ ...aulaForm, titulo: '', iframeUrl: '', descricao: '' });
    } catch (err) { alert('Erro ao adicionar aula'); }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'cursos', selectedCursoView, 'modulos', selectedModuloView, 'aulas', editLesson.id), {
        titulo: editLesson.titulo, iframeUrl: editLesson.iframeUrl, descricao: editLesson.descricao
      });
      alert("Atualizada!"); setEditLesson(null); fetchAulasView(selectedCursoView, selectedModuloView);
    } catch (error) { alert("Erro ao atualizar"); }
  };

  const handleDeleteAula = async (courseId, moduleId, lessonId) => {
    if(window.confirm("Excluir esta transmissão?")) {
      await deleteDoc(doc(db, 'cursos', courseId, 'modulos', moduleId, 'aulas', lessonId));
      fetchAulasView(courseId, moduleId);
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-card">
        <h3>Injetar Transmissão (Aula)</h3>
        <form onSubmit={handleAddAula}>
          <select value={aulaForm.courseId} onChange={e => setAulaForm({...aulaForm, courseId: e.target.value, moduleId: ''})} required>
            <option value="">1. Selecione a Trilha...</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
          <select value={aulaForm.moduleId} onChange={e => setAulaForm({...aulaForm, moduleId: e.target.value})} required disabled={!aulaForm.courseId}>
            <option value="">2. Selecione o Módulo...</option>
            {formModulosOptions.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
          </select>
          <input type="text" placeholder="Título da Aula" value={aulaForm.titulo} onChange={e => setAulaForm({...aulaForm, titulo: e.target.value})} required />
          <input type="url" placeholder="URL do Iframe (Youtube/Vimeo)" value={aulaForm.iframeUrl} onChange={e => setAulaForm({...aulaForm, iframeUrl: e.target.value})} required />
          <textarea placeholder="Descrição da Transmissão (Opcional)" value={aulaForm.descricao} onChange={e => setAulaForm({...aulaForm, descricao: e.target.value})}></textarea>
          <button type="submit" className="btn-save">Publicar Transmissão</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Transmissões Cadastradas</h3>
        <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
          <select className="filter-select" value={selectedCursoView} onChange={(e) => { setSelectedCursoView(e.target.value); fetchModulosForView(e.target.value); setSelectedModuloView(''); setAulasView([]); }}>
            <option value="">Filtrar Trilha...</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
          <select className="filter-select" value={selectedModuloView} onChange={(e) => { setSelectedModuloView(e.target.value); fetchAulasView(selectedCursoView, e.target.value); }} disabled={!selectedCursoView}>
            <option value="">Filtrar Módulo...</option>
            {modulosViewSelect.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
          </select>
        </div>

        <ul className="admin-list">
          {aulasView.length === 0 ? <p style={{color:'#555'}}>Selecione Trilha e Módulo.</p> : aulasView.map(a => (
            <li key={a.id}>
              <span>{a.titulo}</span>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => setEditLesson(a)}><IoPencilOutline /></button>
                <button className="btn-delete" onClick={() => handleDeleteAula(selectedCursoView, selectedModuloView, a.id)}><IoTrashOutline /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editLesson && (
        <div className="modal-overlay">
          <div className="admin-card modal-content">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <h3>Editar Transmissão</h3>
              <button onClick={() => setEditLesson(null)} className="btn-close"><IoCloseOutline size={24}/></button>
            </div>
            <form onSubmit={handleUpdateLesson}>
              <input type="text" value={editLesson.titulo} onChange={e => setEditLesson({...editLesson, titulo: e.target.value})} required />
              <input type="url" value={editLesson.iframeUrl} onChange={e => setEditLesson({...editLesson, iframeUrl: e.target.value})} required />
              <textarea value={editLesson.descricao} onChange={e => setEditLesson({...editLesson, descricao: e.target.value})}></textarea>
              <button type="submit" className="btn-save">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
export default AdminAulas;