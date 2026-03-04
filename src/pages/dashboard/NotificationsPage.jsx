import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  IoMailUnreadOutline, IoMailOpenOutline, IoTrashOutline, IoCheckmarkDoneOutline, 
  IoPlanetOutline, IoPersonOutline, IoHeadsetOutline, IoStarOutline, IoStar, 
  IoCodeSlash, IoArrowBack, IoReturnUpBack, IoEllipsisVertical, IoSend, IoClose, 
  IoAdd, IoPaperPlaneOutline, IoChevronDownOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import './NotificationsPage.css';

// --- DEFINIÇÃO DO ADMIN ---
const ADMIN_EMAIL = 'joao@devweb.com';

const NotificationsPage = () => {
  const { currentUser } = useAuth(); 
  
  // Cria o ALIAS de email automaticamente (ex: joao@gmail.com -> joao@devweb.com)
  const myDevEmail = currentUser?.email ? `${currentUser.email.split('@')[0].toLowerCase()}@devweb.com` : '';
  
  // Verifica se o usuário atual é o admin (João)
  const isJoao = myDevEmail === ADMIN_EMAIL;

  const [notifications, setNotifications] = useState([]);
  const [currentTab, setCurrentTab] = useState('inbox'); 
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  
  // Adicionado o 'from' para o João poder camuflar o remetente
  const [replyData, setReplyData] = useState({ from: '', to: '', subject: '', body: '' });
  
  const [contacts, setContacts] = useState([
    { email: "suporte@devweb.com", name: "Suporte Técnico" },
    { email: "feedback@devweb.com", name: "Sistema de Feedback" }
  ]);

  // --- 1. BUSCAR CONTATOS DO RANKING PARA O SELECT ---
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const dynamicContacts = [];

        usersSnap.forEach(userDoc => {
          const userData = userDoc.data();
          if (userData.email && !userData.isHiddenInRanking && userData.accessKey !== 'curso2025') {
            const alias = `${userData.email.split('@')[0].toLowerCase()}@devweb.com`;
            if (alias !== myDevEmail) {
              dynamicContacts.push({
                email: alias,
                name: userData.displayName ? userData.displayName.toUpperCase() : 'OPERADOR'
              });
            }
          }
        });

        dynamicContacts.sort((a, b) => a.name.localeCompare(b.name));

        setContacts([
          { email: "suporte@devweb.com", name: "SUPORTE TÉCNICO" },
          { email: "feedback@devweb.com", name: "SISTEMA DE FEEDBACK" },
          ...dynamicContacts
        ]);
      } catch (error) {
        console.error("Erro ao buscar lista de contatos:", error);
      }
    };
    fetchContacts();
  }, [myDevEmail]);

  // --- 2. BUSCAR EMAILS NO FIREBASE EM TEMPO REAL ---
  useEffect(() => {
    if (!myDevEmail) return;

    // Se for o João, ele puxa os e-mails dele e também os enviados para os canais do sistema!
    const qInbox = isJoao 
      ? query(collection(db, 'emails'), where('to', 'in', [myDevEmail, 'suporte@devweb.com', 'feedback@devweb.com']))
      : query(collection(db, 'emails'), where('to', '==', myDevEmail));

    const qSent = isJoao
      ? query(collection(db, 'emails'), where('from', 'in', [myDevEmail, 'suporte@devweb.com', 'feedback@devweb.com']))
      : query(collection(db, 'emails'), where('from', '==', myDevEmail));

    const unsubscribeInbox = onSnapshot(qInbox, (snapshot) => {
      const inboxData = snapshot.docs.map(doc => ({ id: doc.id, folder: 'inbox', ...doc.data() }));
      updateMessages(inboxData, 'inbox');
    });

    const unsubscribeSent = onSnapshot(qSent, (snapshot) => {
      const sentData = snapshot.docs.map(doc => ({ id: doc.id, folder: 'sent', ...doc.data() }));
      updateMessages(sentData, 'sent');
    });

    return () => {
      unsubscribeInbox();
      unsubscribeSent();
    };
  }, [myDevEmail, isJoao]);

  const updateMessages = (newMsgs, type) => {
    setNotifications(prev => {
      const filteredPrev = prev.filter(msg => msg.folder !== type);
      const combined = [...filteredPrev, ...newMsgs];
      return combined.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    });
  };

  const filteredList = notifications.filter(n => {
    if (currentTab === 'inbox') return n.folder === 'inbox';
    if (currentTab === 'sent') return n.folder === 'sent';
    if (currentTab === 'starred') return n.starred; 
    return true;
  });

  // --- 3. AÇÕES DO SISTEMA ---
  const openNotification = async (notif) => {
    if (!notif.read && notif.folder === 'inbox') {
      await updateDoc(doc(db, 'emails', notif.id), { read: true });
    }
    setSelectedNotification(notif);
  };

  const closeNotification = () => setSelectedNotification(null);

  const toggleStar = async (id, currentStatus, e) => {
    e?.stopPropagation();
    await updateDoc(doc(db, 'emails', id), { starred: !currentStatus });
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => ({ ...prev, starred: !currentStatus }));
    }
  };

  const deleteNotification = async (id, e) => {
    e?.stopPropagation();
    await deleteDoc(doc(db, 'emails', id));
    if (selectedNotification?.id === id) setSelectedNotification(null);
    toast.info("E-mail removido dos registros.");
  };

  const markAllRead = async () => {
    const unreadInbox = notifications.filter(n => n.folder === 'inbox' && !n.read);
    for (let notif of unreadInbox) {
      await updateDoc(doc(db, 'emails', notif.id), { read: true });
    }
    toast.success("Protocolos marcados como lidos.");
  };

  const handleOpenCompose = (isReply = false) => {
    let defaultFrom = myDevEmail;

    if (isReply && selectedNotification) {
      // Se o João estiver respondendo um ticket do suporte, o sistema automaticamente 
      // troca o remetente dele para "suporte@devweb.com" para manter o disfarce
      if (isJoao && ['suporte@devweb.com', 'feedback@devweb.com'].includes(selectedNotification.to)) {
        defaultFrom = selectedNotification.to;
      }

      const dateStr = selectedNotification.createdAt?.toDate().toLocaleDateString('pt-BR') || 'recentemente';
      setReplyData({
        from: defaultFrom,
        to: selectedNotification.from,
        subject: `RE: ${selectedNotification.title}`,
        body: `\n\n\n> Registro gravado em ${dateStr} por [${selectedNotification.senderName}]:\n> ${selectedNotification.body.replace(/\n/g, '\n> ')}`
      });
    } else {
      setReplyData({ from: myDevEmail, to: '', subject: '', body: '' });
    }
    setIsComposing(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!replyData.to) {
      toast.warning("Selecione um destinatário válido.");
      return;
    }
    
    let type = 'user';
    if (replyData.to.includes('suporte')) type = 'support';
    if (replyData.to.includes('feedback')) type = 'system';
    
    // Define o email de envio (O João pode camuflar o e-mail se quiser)
    const senderEmail = isJoao ? replyData.from : myDevEmail;
    let finalSenderName = currentUser.displayName ? currentUser.displayName.toUpperCase() : 'OPERADOR DEVWEB';
    
    // Se o João estiver enviando como Suporte, muda o nome também
    if (senderEmail === 'suporte@devweb.com') finalSenderName = 'SUPORTE TÉCNICO';
    if (senderEmail === 'feedback@devweb.com') finalSenderName = 'SISTEMA DE FEEDBACK';

    try {
      await addDoc(collection(db, 'emails'), {
        to: replyData.to.toLowerCase(),
        from: senderEmail,
        senderName: finalSenderName,
        type: type,
        title: replyData.subject || 'SEM ASSUNTO',
        message: replyData.body.split('\n')[0].substring(0, 50) + '...',
        body: replyData.body,
        read: false,
        starred: false,
        createdAt: serverTimestamp()
      });

      setIsComposing(false);
      toast.success(`Transmissão enviada para ${replyData.to}`);
    } catch (error) {
      console.error("Erro na transmissão:", error);
      toast.error("Falha ao enviar pacote de dados.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'SINC...';
    const date = timestamp.toDate();
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}H`;
  };

  const getTypeIcon = (type, folder) => {
    if (folder === 'sent') return <IoPaperPlaneOutline className="sx-icon sent" title="Enviado" />;
    switch (type) {
      case 'system': return <IoPlanetOutline className="sx-icon system" title="Sistema" />;
      case 'support': return <IoHeadsetOutline className="sx-icon support" title="Suporte Oficial" />;
      case 'user': return <IoPersonOutline className="sx-icon user" title="Contato" />;
      default: return <IoCodeSlash className="sx-icon" />;
    }
  };

  return (
    <div className="sx-mail-wrapper">
      <div className="sx-mail-container">
        
        {/* --- MODAL DE COMPOSIÇÃO (HUD TÉCNICO) --- */}
        {isComposing && (
          <div className="sx-compose-overlay">
            <div className="sx-compose-modal">
              <div className="sx-compose-header">
                <h3>LINK DE COMUNICAÇÃO</h3>
                <button type="button" onClick={() => setIsComposing(false)}><IoClose /></button>
              </div>
              
              <form onSubmit={handleSendEmail} className="sx-compose-form">
                
                <div className="sx-field-row">
                  <label>DE:</label>
                  {/* Se for o João (admin), ele tem um dropdown para escolher quem ele é. Se não, é um input desativado normal */}
                  {isJoao ? (
                    <div className="sx-select-wrapper">
                      <select 
                        className="sx-select"
                        value={replyData.from}
                        onChange={e => setReplyData({...replyData, from: e.target.value})}
                      >
                        <option value={myDevEmail}>JOÃO ({myDevEmail})</option>
                        <option value="suporte@devweb.com">SUPORTE TÉCNICO (suporte@devweb.com)</option>
                        <option value="feedback@devweb.com">SISTEMA DE FEEDBACK (feedback@devweb.com)</option>
                      </select>
                      <IoChevronDownOutline className="sx-select-icon" />
                    </div>
                  ) : (
                    <input type="text" value={myDevEmail} disabled className="sx-input disabled" />
                  )}
                </div>

                <div className="sx-field-row">
                  <label>PARA:</label>
                  <div className="sx-select-wrapper">
                    <select 
                      className="sx-select"
                      value={replyData.to}
                      onChange={e => setReplyData({...replyData, to: e.target.value})}
                      required
                    >
                      <option value="" disabled>SELECIONE O DESTINATÁRIO...</option>
                      {contacts.map(contact => (
                        <option key={contact.email} value={contact.email}>
                          {contact.name} ({contact.email})
                        </option>
                      ))}
                    </select>
                    <IoChevronDownOutline className="sx-select-icon" />
                  </div>
                </div>

                <div className="sx-field-row">
                  <label>REF:</label>
                  <input 
                    type="text" 
                    className="sx-input"
                    value={replyData.subject} 
                    onChange={e => setReplyData({...replyData, subject: e.target.value})}
                    placeholder="ASSUNTO DA TRANSMISSÃO"
                  />
                </div>

                <textarea 
                  className="sx-compose-body"
                  value={replyData.body}
                  onChange={e => setReplyData({...replyData, body: e.target.value})}
                  placeholder="INSERIR DADOS DA MENSAGEM..."
                  required
                ></textarea>

                <div className="sx-compose-footer">
                  <button type="submit" className="sx-btn-transmit">
                    TRANSMITIR DADOS <IoSend />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODO LEITURA --- */}
        {selectedNotification ? (
          <div className="sx-detail-view">
            <div className="sx-toolbar">
              <button className="sx-btn-icon text" onClick={closeNotification}>
                <IoArrowBack /> VOLTAR
              </button>
              
              <div className="sx-toolbar-actions">
                 <button className="sx-btn-icon" onClick={(e) => toggleStar(selectedNotification.id, selectedNotification.starred, e)}>
                   {selectedNotification.starred ? <IoStar className="sx-star-active"/> : <IoStarOutline />}
                 </button>
                 <button className="sx-btn-icon delete" onClick={(e) => deleteNotification(selectedNotification.id, e)}>
                   <IoTrashOutline />
                 </button>
              </div>
            </div>

            <div className="sx-detail-scroll">
              <h1 className="sx-detail-subject">{selectedNotification.title}</h1>
              
              <div className="sx-detail-meta">
                <div className="sx-meta-avatar">
                   {getTypeIcon(selectedNotification.type, selectedNotification.folder)}
                </div>
                <div className="sx-meta-info">
                  <span className="sx-meta-name">{selectedNotification.senderName}</span>
                  <span className="sx-meta-email">
                    {selectedNotification.folder === 'sent' ? `PARA: ${selectedNotification.to}` : `DE: <${selectedNotification.from}>`}
                  </span>
                </div>
                <div className="sx-meta-time">
                  {formatDate(selectedNotification.createdAt)}
                </div>
              </div>

              <div className="sx-detail-body">
                {selectedNotification.body}
              </div>

              {selectedNotification.folder !== 'sent' && (
                <div className="sx-detail-footer">
                  <button className="sx-btn-outline" onClick={() => handleOpenCompose(true)}>
                     <IoReturnUpBack /> RESPONDER
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- MODO LISTA DE EMAILS --- */
          <>
            <div className="sx-header">
              <div className="sx-tabs">
                <button className={`sx-tab ${currentTab === 'inbox' ? 'active' : ''}`} onClick={() => setCurrentTab('inbox')}>
                  SECURE INBOX
                  {notifications.filter(n => n.folder === 'inbox' && !n.read).length > 0 && 
                    <span className="sx-badge">{notifications.filter(n => n.folder === 'inbox' && !n.read).length}</span>
                  }
                </button>
                <button className={`sx-tab ${currentTab === 'sent' ? 'active' : ''}`} onClick={() => setCurrentTab('sent')}>
                  TRANSMITIDOS
                </button>
                <button className={`sx-tab ${currentTab === 'starred' ? 'active' : ''}`} onClick={() => setCurrentTab('starred')}>
                  MARCADOS
                </button>
              </div>
              <div className="sx-header-actions">
                <button className="sx-btn-solid" onClick={() => handleOpenCompose(false)}>
                  <IoAdd /> NOVA MENSAGEM
                </button>
                <button className="sx-btn-icon" title="Validar todos" onClick={markAllRead}>
                  <IoCheckmarkDoneOutline />
                </button>
              </div>
            </div>

            <div className="sx-list">
              {filteredList.length === 0 ? (
                <div className="sx-empty">
                  <IoMailOpenOutline className="sx-empty-icon" />
                  <p>NENHUM REGISTRO ENCONTRADO NO BANCO DE DADOS.</p>
                </div>
              ) : (
                filteredList.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`sx-row ${notif.read ? 'read' : 'unread'}`}
                    onClick={() => openNotification(notif)}
                  >
                    <div className="sx-row-star" onClick={(e) => toggleStar(notif.id, notif.starred, e)}>
                      {notif.starred ? <IoStar className="sx-star-active"/> : <IoStarOutline />}
                    </div>
                    
                    <div className="sx-row-sender">
                      {getTypeIcon(notif.type, notif.folder)}
                      <span>{notif.senderName}</span>
                    </div>
                    
                    <div className="sx-row-content">
                      <span className="sx-row-title">{notif.title}</span>
                      <span className="sx-row-snippet">{notif.message}</span>
                    </div>
                    
                    <div className="sx-row-meta">
                      <span className="sx-row-date">{formatDate(notif.createdAt).split(' ')[0]}</span>
                      <button className="sx-row-delete" onClick={(e) => deleteNotification(notif.id, e)}>
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default NotificationsPage;