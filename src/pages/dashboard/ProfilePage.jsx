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
  
  const [formData, setFormData] = useState({ 
    displayName: '', 
    photoURL: '',
    role: 'OPERADOR PADRÃO', 
    accessKey: ''
  });

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
            role: firestoreData.role || 'DESENVOLVEDOR',
            accessKey: firestoreData.accessKey || 'ACESSO PADRÃO',
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
        console.error("Erro na leitura do dossiê:", error);
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
      await updateProfile(currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      setProfileData(prev => ({
        ...prev,
        displayName: formData.displayName,
        photoURL: formData.photoURL
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error("Erro na gravação de dados:", error);
      alert("Falha na gravação. Verifique a conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="star-pf-loading">
      <div className="star-pf-spinner"></div>
      <span>CARREGANDO DOSSIÊ...</span>
    </div>
  );

  const joinDate = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('pt-BR') : 'DESCONHECIDA';

  return (
    <div className="star-pf-wrapper">
      
      <div className="star-pf-card">
        
        {/* --- Header do Card (Identificação) --- */}
        <div className="star-pf-header">
          <div className="star-pf-avatar-section">
            <div className="star-pf-avatar-target">
              <img 
                src={isEditing ? (formData.photoURL || userAvatarPlaceholder) : (profileData?.photoURL || userAvatarPlaceholder)} 
                alt="Operador" 
                className="star-pf-img"
                onError={(e) => e.target.src = userAvatarPlaceholder}
              />
            </div>
            {isEditing && (
              <div className="star-pf-avatar-hint">
                <IoCamera /> INSERIR URL
              </div>
            )}
          </div>

          <div className="star-pf-title-block">
            <span className="star-pf-overline">REGISTRO DE OPERADOR</span>
            <h1>{profileData?.displayName || 'NÃO IDENTIFICADO'}</h1>
            <span className="star-pf-badge">{profileData?.role}</span>
          </div>
        </div>

        {/* --- Área de Conteúdo --- */}
        <div className="star-pf-body">
          
          {!isEditing ? (
            /* MODO VISUALIZAÇÃO */
            <div className="star-pf-view-mode">
              
              <div className="star-pf-stats-grid">
                <div className="star-pf-stat-box">
                  <IoMail className="star-pf-icon" />
                  <div className="star-pf-stat-data">
                    <small>ENDEREÇO DE COMUNICAÇÃO</small>
                    <span>{profileData?.email}</span>
                  </div>
                </div>
                
                <div className="star-pf-stat-box">
                  <IoCalendarOutline className="star-pf-icon" />
                  <div className="star-pf-stat-data">
                    <small>DATA DE ENGAJAMENTO</small>
                    <span>{joinDate}</span>
                  </div>
                </div>
                
                <div className="star-pf-stat-box highlight-box">
                  <IoKeyOutline className="star-pf-icon" />
                  <div className="star-pf-stat-data">
                    <small>NÍVEL DE CREDENCIAL</small>
                    <span>{profileData?.accessKey}</span>
                  </div>
                </div>
              </div>

              <div className="star-pf-action-row">
                <button className="star-pf-btn-primary" onClick={() => setIsEditing(true)}>
                  <IoPencil /> ATUALIZAR PARÂMETROS
                </button>
              </div>
            </div>
          ) : (
            /* MODO EDIÇÃO */
            <form className="star-pf-edit-form" onSubmit={handleSave}>
              <div className="star-pf-form-grid">
                
                <div className="star-pf-input-group">
                  <label><IoPerson /> IDENTIFICAÇÃO (NOME)</label>
                  <input 
                    type="text" 
                    name="displayName" 
                    value={formData.displayName} 
                    onChange={handleInputChange}
                    placeholder="Insira o nome de exibição..."
                  />
                </div>

                <div className="star-pf-input-group">
                  <label><IoCamera /> FONTE VISUAL (URL DA FOTO)</label>
                  <input 
                    type="text" 
                    name="photoURL" 
                    value={formData.photoURL} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                  <small className="star-pf-helper">Forneça o link direto para a imagem do servidor externo.</small>
                </div>

                <div className="star-pf-input-group disabled">
                  <label><IoMail /> COMUNICAÇÃO (TRAVADO)</label>
                  <input type="text" value={profileData?.email} disabled />
                </div>
              </div>

              <div className="star-pf-footer-actions">
                <button 
                  type="button" 
                  className="star-pf-btn-ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: profileData.displayName,
                      photoURL: profileData.photoURL
                    });
                  }}
                >
                  <IoClose /> ABORTAR
                </button>
                
                <button type="submit" className="star-pf-btn-primary" disabled={isSaving}>
                  {isSaving ? 'GRAVANDO...' : <><IoSave /> CONFIRMAR DADOS</>}
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