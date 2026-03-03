import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { IoCamera, IoPerson, IoMail, IoSave, IoClose, IoPencil, IoKeyOutline, IoCalendarOutline } from 'react-icons/io5';
import userAvatarPlaceholder from '../../assets/images/user-avatar.png';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({ 
    displayName: '', 
    photoURL: '',
    role: 'Estudante', // Default
    accessKey: ''
  });

  // Busca dados iniciais
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data();
          
          const combinedData = {
            email: currentUser.email,
            displayName: firestoreData.displayName || currentUser.displayName || '',
            photoURL: firestoreData.photoURL || currentUser.photoURL || '',
            role: firestoreData.role || 'Desenvolvedor',
            accessKey: firestoreData.accessKey || 'Gratuito',
            createdAt: currentUser.metadata.creationTime
          };

          setProfileData(combinedData);
          setFormData({
            displayName: combinedData.displayName,
            photoURL: combinedData.photoURL,
            role: combinedData.role,
            accessKey: combinedData.accessKey
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Atualiza no Firebase Auth
      await updateProfile(currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      // 2. Atualiza no Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      // Atualiza estado local
      setProfileData(prev => ({
        ...prev,
        displayName: formData.displayName,
        photoURL: formData.photoURL
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="profile-loading"><div className="spinner-profile"></div></div>;

  // Formata data de entrada
  const joinDate = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida';

  return (
    <div className="profile-page-wrapper">
      <div className="profile-glow-bg"></div>

      <div className="profile-glass-card">
        
        {/* --- Header do Card (Avatar e Capa) --- */}
        <div className="profile-header-section">
          <div className="header-cover-decoration"></div>
          
          <div className="avatar-container">
            <div className="avatar-ring">
              <img 
                src={isEditing ? (formData.photoURL || userAvatarPlaceholder) : (profileData?.photoURL || userAvatarPlaceholder)} 
                alt="Profile" 
                className="profile-img-lg"
                onError={(e) => e.target.src = userAvatarPlaceholder}
              />
            </div>
            {isEditing && (
              <div className="avatar-edit-hint">
                <IoCamera /> Cole a URL abaixo
              </div>
            )}
          </div>

          <div className="profile-title-block">
            <h1>{profileData?.displayName || 'Usuário Sem Nome'}</h1>
            <span className="user-role-badge">{profileData?.role}</span>
          </div>
        </div>

        {/* --- Área de Conteúdo (View vs Edit) --- */}
        <div className="profile-content-body">
          
          {!isEditing ? (
            // MODO VISUALIZAÇÃO
            <div className="view-mode-grid">
              
              {/* Stats Rápidos */}
              <div className="quick-stats-row">
                <div className="stat-pill">
                  <IoMail className="stat-icon" />
                  <span>{profileData?.email}</span>
                </div>
                <div className="stat-pill">
                  <IoCalendarOutline className="stat-icon" />
                  <span>Membro desde {joinDate}</span>
                </div>
                <div className="stat-pill gold">
                  <IoKeyOutline className="stat-icon" />
                  <span>Acesso: {profileData?.accessKey}</span>
                </div>
              </div>

              <div className="action-row-center">
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                  <IoPencil /> Editar Perfil
                </button>
              </div>
            </div>
          ) : (
            // MODO EDIÇÃO
            <form className="edit-mode-form" onSubmit={handleSave}>
              <div className="form-grid">
                
                {/* Campo Nome */}
                <div className="input-group">
                  <label><IoPerson /> Nome de Exibição</label>
                  <input 
                    type="text" 
                    name="displayName" 
                    value={formData.displayName} 
                    onChange={handleInputChange}
                    placeholder="Como quer ser chamado?"
                  />
                </div>

                {/* Campo Foto URL */}
                <div className="input-group">
                  <label><IoCamera /> URL da Foto (Avatar)</label>
                  <input 
                    type="text" 
                    name="photoURL" 
                    value={formData.photoURL} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                  <small className="input-helper">Cole um link direto de imagem (Imgur, GitHub, etc).</small>
                </div>

                {/* Campos Read-Only */}
                <div className="input-group disabled">
                  <label><IoMail /> E-mail (Não editável)</label>
                  <input type="text" value={profileData?.email} disabled />
                </div>
              </div>

              <div className="form-actions-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ // Reseta formulário
                      displayName: profileData.displayName,
                      photoURL: profileData.photoURL
                    });
                  }}
                >
                  <IoClose /> Cancelar
                </button>
                
                <button type="submit" className="btn-save" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : <><IoSave /> Salvar Alterações</>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;