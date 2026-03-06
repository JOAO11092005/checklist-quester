import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { IoTrashOutline, IoPencilOutline, IoCloseOutline } from 'react-icons/io5';

const AdminTrilhas = () => {
  const [cursos, setCursos] = useState([]);
  const [trilhaForm, setTrilhaForm] = useState({ titulo: '', tipo: '', imagemUrl: '' });
  const [editCourse, setEditCourse] = useState(null);

  // Busca as trilhas no banco de dados
  const fetchCursos = async () => {
    try {
      const snap = await getDocs(collection(db, 'cursos'));
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordena alfabeticamente pelo título
      setCursos(lista.sort((a, b) => a.titulo.localeCompare(b.titulo)));
    } catch (error) { 
      console.error("Erro ao buscar trilhas:", error); 
    }
  };

  useEffect(() => { 
    fetchCursos(); 
  }, []);

  // Adiciona uma nova trilha
  const handleAddTrilha = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'cursos'), {
        titulo: trilhaForm.titulo, 
        tipo: trilhaForm.tipo.toUpperCase(),
        imagemUrl: trilhaForm.imagemUrl, 
        criadoEm: serverTimestamp()
      });
      alert('Trilha (Missão) inicializada com sucesso!'); 
      setTrilhaForm({ titulo: '', tipo: '', imagemUrl: '' }); 
      fetchCursos();
    } catch (err) { 
      alert('Erro ao gravar trilha no banco de dados.'); 
    }
  };

  // Atualiza uma trilha existente
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'cursos', editCourse.id), {
        titulo: editCourse.titulo, 
        tipo: editCourse.tipo.toUpperCase(), 
        imagemUrl: editCourse.imagemUrl
      });
      alert("Parâmetros da trilha atualizados!"); 
      setEditCourse(null); 
      fetchCursos();
    } catch (error) { 
      alert("Falha na atualização dos dados."); 
    }
  };

  // Deleta uma trilha
  const handleDeleteTrilha = async (id) => {
    if(window.confirm("ALERTA: Apagar a trilha não apagará os módulos automaticamente. Certifique-se de limpar os módulos e aulas vinculados primeiro para evitar resíduos no banco. Confirmar exclusão?")) {
      try {
        await deleteDoc(doc(db, 'cursos', id)); 
        fetchCursos();
      } catch (error) {
        alert("Erro ao excluir trilha.");
      }
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      {/* FORMULÁRIO DE CRIAÇÃO */}
      <div className="admin-card">
        <h3><IoPencilOutline /> Inicializar Nova Trilha</h3>
        <form onSubmit={handleAddTrilha}>
          <label style={{color: '#888', fontSize: '0.8rem'}}>TÍTULO DA MISSÃO</label>
          <input 
            type="text" 
            placeholder="Ex: Dominando React" 
            value={trilhaForm.titulo} 
            onChange={e => setTrilhaForm({...trilhaForm, titulo: e.target.value})} 
            required 
          />
          
          <label style={{color: '#888', fontSize: '0.8rem'}}>CATEGORIA (FRONT-END / BACK-END)</label>
          <input 
            type="text" 
            placeholder="Digite exatamente FRONT-END ou BACK-END" 
            value={trilhaForm.tipo} 
            onChange={e => setTrilhaForm({...trilhaForm, tipo: e.target.value})} 
            required 
          />
          
          <label style={{color: '#888', fontSize: '0.8rem'}}>URL DA IMAGEM DE CAPA</label>
          <input 
            type="url" 
            placeholder="https://link-da-imagem.jpg" 
            value={trilhaForm.imagemUrl} 
            onChange={e => setTrilhaForm({...trilhaForm, imagemUrl: e.target.value})} 
          />
          
          <button type="submit" className="btn-save">GRAVAR TRILHA NO SISTEMA</button>
        </form>
      </div>

      {/* LISTAGEM DE TRILHAS */}
      <div className="admin-card">
        <h3>Trilhas Ativas no Banco</h3>
        <ul className="admin-list">
          {cursos.length === 0 ? (
            <p style={{color: '#555', textAlign: 'center'}}>Nenhuma trilha detectada.</p>
          ) : (
            cursos.map(c => (
              <li key={c.id}>
                <span>
                  <strong>{c.titulo}</strong> 
                  <small style={{color:'#00d2ff', marginLeft: '10px'}}>[{c.tipo}]</small>
                </span>
                <div className="item-actions">
                  <button className="btn-edit" onClick={() => setEditCourse(c)} title="Editar">
                    <IoPencilOutline />
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteTrilha(c.id)} title="Excluir">
                    <IoTrashOutline />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editCourse && (
        <div className="modal-overlay">
          <div className="admin-card modal-content">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: '20px'}}>
              <h3>ALTERAR PARÂMETROS</h3>
              <button onClick={() => setEditCourse(null)} className="btn-close">
                <IoCloseOutline size={28}/>
              </button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <label>TÍTULO</label>
              <input 
                type="text" 
                value={editCourse.titulo} 
                onChange={e => setEditCourse({...editCourse, titulo: e.target.value})} 
                required 
              />
              <label>CATEGORIA</label>
              <input 
                type="text" 
                value={editCourse.tipo} 
                onChange={e => setEditCourse({...editCourse, tipo: e.target.value})} 
                required 
              />
              <label>URL DA IMAGEM</label>
              <input 
                type="url" 
                value={editCourse.imagemUrl || ''} 
                onChange={e => setEditCourse({...editCourse, imagemUrl: e.target.value})} 
              />
              <button type="submit" className="btn-save">ATUALIZAR DADOS</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminTrilhas;