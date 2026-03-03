import React, { useState } from 'react';
import { 
  IoMailUnreadOutline, 
  IoMailOpenOutline, 
  IoTrashOutline, 
  IoCheckmarkDoneOutline, 
  IoPlanetOutline, 
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoStarOutline,
  IoStar,
  IoCodeSlash,
  IoArrowBack,
  IoReturnUpBack,
  IoEllipsisVertical,
  IoSend,
  IoClose,
  IoAdd,
  IoPaperPlaneOutline // Ícone para enviados
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import './NotificationsPage.css';

// --- DADOS REAIS (INBOX & SENT) ---
const MOCK_DATA = [
  // 1. Email de Boas Vindas (Inbox)
  { 
    id: 1, 
    folder: 'inbox',
    type: 'welcome', 
    sender: 'Equipe DEVWEB', 
    email: 'no-reply@devweb.com',
    title: 'Bem-vindo ao DEVWEB!', 
    message: 'Sua jornada para dominar o código começa agora.',
    body: `Olá Dev,

Seja muito bem-vindo à plataforma DEVWEB. Estamos empolgados em ter você conosco nessa jornada.

Para começar com o pé direito:
1. Complete seu perfil;
2. Escolha sua trilha de estudos;
3. Entre na comunidade no Discord.

Bons estudos,
Equipe DEVWEB.`,
    date: 'Agora', 
    read: false, 
    starred: true 
  },
  // 2. Email de Segurança (Inbox)
  { 
    id: 2, 
    folder: 'inbox',
    type: 'security', 
    sender: 'Segurança', 
    email: 'security@devweb.com',
    title: 'Novo login detectado', 
    message: 'Detectamos um novo acesso à sua conta (São Paulo, SP).',
    body: `Detectamos um novo acesso à sua conta.

Dispositivo: Chrome no Windows
Localização: São Paulo, SP
IP: 192.168.1.1

Se foi você, pode ignorar este e-mail. Caso contrário, altere sua senha imediatamente para garantir a integridade dos seus dados.`,
    date: '10:42', 
    read: false, 
    starred: false 
  },
  // 3. Exemplo de Email Enviado (Sent)
  {
    id: 3,
    folder: 'sent',
    type: 'sent',
    sender: 'Você', // Quem enviou
    email: 'suporte@devweb.com', // Para quem foi
    title: 'Dúvida sobre o módulo de React',
    message: 'Gostaria de saber quando saem as novas aulas...',
    body: `Olá equipe,

Gostaria de saber a previsão para o lançamento das aulas avançadas de Hooks no módulo de React.

Aguardo retorno.`,
    date: 'Ontem',
    read: true,
    starred: false
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(MOCK_DATA);
  // Tabs: 'inbox' (Principal), 'sent' (Enviados), 'starred' (Favoritos)
  const [currentTab, setCurrentTab] = useState('inbox'); 
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Modal State
  const [isComposing, setIsComposing] = useState(false);
  const [replyData, setReplyData] = useState({ to: '', subject: '', body: '' });

  // --- FILTROS INTELIGENTES ---
  const filteredList = notifications.filter(n => {
    if (currentTab === 'inbox') return n.folder === 'inbox';
    if (currentTab === 'sent') return n.folder === 'sent';
    if (currentTab === 'starred') return n.starred; // Mostra favoritos de qualquer pasta
    return true;
  });

  // --- AÇÕES ---
  const openNotification = (notif) => {
    if (!notif.read && notif.folder === 'inbox') {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    setSelectedNotification(notif);
  };

  const closeNotification = () => setSelectedNotification(null);

  const toggleStar = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => ({ ...prev, starred: !prev.starred }));
    }
  };

  const deleteNotification = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) setSelectedNotification(null);
    toast.info("Mensagem movida para a lixeira.");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Tudo marcado como lido.");
  };

  // --- ENVIAR EMAIL REAL (SIMULAÇÃO) ---
  const handleOpenCompose = (isReply = false) => {
    if (isReply && selectedNotification) {
      setReplyData({
        to: selectedNotification.email, // Responde para quem enviou
        subject: `Re: ${selectedNotification.title}`,
        body: `\n\n--- Em resposta a ${selectedNotification.sender} ---\n${selectedNotification.body.substring(0, 80)}...`
      });
    } else {
      setReplyData({ to: '', subject: '', body: '' });
    }
    setIsComposing(true);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    
    // Cria o objeto do novo email
    const newEmail = {
      id: Date.now(),
      folder: 'sent', // Vai para a pasta Enviados
      type: 'sent',
      sender: 'Você',
      email: replyData.to, // Mostra para quem foi enviado
      title: replyData.subject || '(Sem assunto)',
      message: replyData.body.substring(0, 40) + '...',
      body: replyData.body,
      date: 'Agora',
      read: true,
      starred: false
    };

    // Adiciona ao topo da lista
    setNotifications(prev => [newEmail, ...prev]);
    
    setIsComposing(false);
    toast.success(`E-mail enviado para ${replyData.to}`);
    
    // Opcional: Mudar para a aba de enviados para ver a mensagem
    // setCurrentTab('sent'); 
  };

  // --- ÍCONES ---
  const getTypeIcon = (type) => {
    switch (type) {
      case 'welcome': return <IoPlanetOutline className="type-icon welcome" />;
      case 'security': return <IoShieldCheckmarkOutline className="type-icon security" />;
      case 'sent': return <IoPaperPlaneOutline className="type-icon sent" />; // Ícone de enviados
      case 'alert': return <IoWarningOutline className="type-icon alert" />;
      default: return <IoCodeSlash className="type-icon default" />;
    }
  };

  return (
    <div className="inbox-page-wrapper">
      <div className="inbox-bg-glow"></div>
      
      <div className="inbox-container glass-effect">
        
        {/* --- MODAL DE COMPOSIÇÃO --- */}
        {isComposing && (
          <div className="compose-overlay">
            <div className="compose-modal">
              <div className="compose-header">
                <h3>Nova Mensagem</h3>
                <button onClick={() => setIsComposing(false)}><IoClose /></button>
              </div>
              <form onSubmit={handleSendEmail} className="compose-form">
                <div className="compose-field">
                  <label>Para:</label>
                  <input 
                    type="email" 
                    value={replyData.to} 
                    onChange={e => setReplyData({...replyData, to: e.target.value})}
                    placeholder="destinatario@exemplo.com"
                    required
                  />
                </div>
                <div className="compose-field">
                  <label>Assunto:</label>
                  <input 
                    type="text" 
                    value={replyData.subject} 
                    onChange={e => setReplyData({...replyData, subject: e.target.value})}
                    placeholder="Assunto do email"
                  />
                </div>
                <textarea 
                  className="compose-body"
                  value={replyData.body}
                  onChange={e => setReplyData({...replyData, body: e.target.value})}
                  placeholder="Escreva sua mensagem aqui..."
                  required
                ></textarea>
                <div className="compose-footer">
                  <button type="submit" className="btn-send-primary">
                    Enviar <IoSend />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODO LEITURA --- */}
        {selectedNotification ? (
          <div className="email-detail-view">
            <div className="detail-toolbar">
              <button className="tool-btn-back" onClick={closeNotification}>
                <IoArrowBack /> Voltar
              </button>
              
              <div className="tool-actions-right">
                 <button className="tool-icon" onClick={() => toggleStar(selectedNotification.id)}>
                   {selectedNotification.starred ? <IoStar className="star-active"/> : <IoStarOutline />}
                 </button>
                 <button className="tool-icon" onClick={() => deleteNotification(selectedNotification.id)}>
                   <IoTrashOutline />
                 </button>
                 <button className="tool-icon">
                   <IoEllipsisVertical />
                 </button>
              </div>
            </div>

            <div className="email-content-scroll">
              <h1 className="email-subject">{selectedNotification.title}</h1>
              
              <div className="email-meta-header">
                <div className="sender-avatar">
                   {getTypeIcon(selectedNotification.type)}
                </div>
                <div className="sender-info">
                  <span className="sender-name-detail">{selectedNotification.sender}</span>
                  <span className="sender-email-detail">
                    {/* Ajuste visual: Se for enviado, mostra "Para: email", se recebido mostra "<email>" */}
                    {selectedNotification.folder === 'sent' ? `Para: ${selectedNotification.email}` : `<${selectedNotification.email}>`}
                  </span>
                  <span className="email-date-detail">{selectedNotification.date}</span>
                </div>
              </div>

              {/* Corpo do email com suporte a quebras de linha e estilo de segurança */}
              <div className={`email-body-text ${selectedNotification.type === 'security' ? 'security-alert-body' : ''}`}>
                {selectedNotification.body}
              </div>

              {/* Botões de Resposta (Apenas se não for mensagem enviada por mim) */}
              {selectedNotification.folder !== 'sent' && (
                <div className="email-reply-area">
                  <button className="btn-reply" onClick={() => handleOpenCompose(true)}>
                     <IoReturnUpBack /> Responder
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- MODO LISTA --- */
          <>
            <div className="inbox-header">
              <div className="header-tabs">
                <button className={`tab-btn ${currentTab === 'inbox' ? 'active' : ''}`} onClick={() => setCurrentTab('inbox')}>
                  Principal
                  {/* Badge apenas para não lidas na Inbox */}
                  {notifications.filter(n => n.folder === 'inbox' && !n.read).length > 0 && 
                    <span className="count-badge">{notifications.filter(n => n.folder === 'inbox' && !n.read).length}</span>
                  }
                </button>
                <button className={`tab-btn ${currentTab === 'sent' ? 'active' : ''}`} onClick={() => setCurrentTab('sent')}>
                  Enviados <IoPaperPlaneOutline style={{marginLeft: 4, fontSize: '0.8rem'}}/>
                </button>
                <button className={`tab-btn ${currentTab === 'starred' ? 'active' : ''}`} onClick={() => setCurrentTab('starred')}>
                  Favoritos
                </button>
              </div>
              <div className="header-actions">
                <button className="action-icon-btn btn-compose-mini" onClick={() => handleOpenCompose(false)} title="Nova Mensagem">
                  <IoAdd />
                </button>
                <button className="action-icon-btn" title="Marcar tudo como lido" onClick={markAllRead}>
                  <IoCheckmarkDoneOutline />
                </button>
              </div>
            </div>

            <div className="inbox-list">
              {filteredList.length === 0 ? (
                <div className="empty-inbox">
                  <div className="empty-icon-circle"><IoMailOpenOutline /></div>
                  <p>
                    {currentTab === 'sent' ? 'Nenhuma mensagem enviada.' : 'Sua caixa de entrada está vazia.'}
                  </p>
                </div>
              ) : (
                filteredList.map((notif, index) => (
                  <div 
                    key={notif.id} 
                    className={`inbox-row ${notif.read ? 'read' : 'unread'}`}
                    style={{ animationDelay: `${index * 0.05}s` }} 
                    onClick={() => openNotification(notif)}
                  >
                    <div className="row-controls">
                      <div className="star-wrapper" onClick={(e) => toggleStar(notif.id, e)}>
                        {notif.starred ? <IoStar className="star-active"/> : <IoStarOutline />}
                      </div>
                    </div>
                    <div className="row-sender">
                      {getTypeIcon(notif.type)}
                      <span className="sender-name">{notif.sender}</span>
                    </div>
                    <div className="row-content">
                      <span className="content-title">{notif.title}</span>
                      <span className="content-separator">-</span>
                      <span className="content-snippet">{notif.message}</span>
                    </div>
                    <div className="row-meta">
                      <span className="date-text">{notif.date}</span>
                      <div className="hover-actions">
                         <button onClick={(e) => deleteNotification(notif.id, e)}><IoTrashOutline /></button>
                      </div>
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