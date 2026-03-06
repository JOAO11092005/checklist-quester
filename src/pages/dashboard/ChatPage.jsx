import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { 
    IoHappyOutline, IoImageOutline, IoSend, IoEllipse, IoTerminalOutline, 
    IoClose, IoHelpCircleOutline, IoSearchOutline, IoPinOutline, IoPin, 
    IoStarOutline, IoStar, IoTrashOutline, IoMegaphoneOutline, IoMegaphone 
} from 'react-icons/io5';
import userAvatarPlaceholder from '../../assets/images/user-avatar.png';

import './ChatPage.css';
import './ChatMobile.css';

const giphyFetch = new GiphyFetch('UR0NoWFVVy7yoU1MXicNCVuMXqn5Ymxf');

const ChatPage = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearchTerm, setGifSearchTerm] = useState('');
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [allUsers, setAllUsers] = useState([]);
    const [showMentionMenu, setShowMentionMenu] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const myMentionTag = currentUser?.displayName ? `@${currentUser.displayName.replace(/\s+/g, '')}` : '@DESENVOLVEDOR';

    const scrollToBottom = () => {
        if (!isSearching && !showFavoritesOnly) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, showEmojiPicker, showGifPicker, isSearching, showFavoritesOnly]);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersList = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            setAllUsers(usersList);
        };
        fetchUsers();

        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- AÇÕES DAS MENSAGENS ---
    const togglePinMessage = async (msgId, pinnedBy = []) => {
        try {
            const isMyPinned = pinnedBy.includes(currentUser.uid);
            await updateDoc(doc(db, 'messages', msgId), {
                pinnedBy: isMyPinned ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
            });
        } catch (error) { console.error("Erro ao fixar para mim:", error); }
    };

    const toggleGlobalPinMessage = async (msgId, currentGlobalStatus) => {
        const confirmar = currentGlobalStatus 
            ? window.confirm("Remover este Anúncio Global para todos?") 
            : window.confirm("Deseja fixar esta mensagem como um Anúncio Global para TODOS os desenvolvedores?");
            
        if (confirmar) {
            try {
                await updateDoc(doc(db, 'messages', msgId), {
                    isPinnedGlobally: !currentGlobalStatus
                });
            } catch (error) { console.error("Erro ao fixar globalmente:", error); }
        }
    };

    const toggleFavoriteMessage = async (msgId, favoritedBy = []) => {
        try {
            const isFav = favoritedBy.includes(currentUser.uid);
            await updateDoc(doc(db, 'messages', msgId), {
                favoritedBy: isFav ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
            });
        } catch (error) { console.error("Erro ao favoritar:", error); }
    };

    const deleteMessage = async (msgId) => {
        if (window.confirm("ATENÇÃO: Deseja excluir esta mensagem permanentemente para todos?")) {
            try {
                await deleteDoc(doc(db, 'messages', msgId));
            } catch (error) { console.error("Erro ao apagar mensagem:", error); }
        }
    };

    // --- FILTROS ---
    let displayedMessages = messages;
    if (showFavoritesOnly) displayedMessages = displayedMessages.filter(m => m.favoritedBy?.includes(currentUser.uid));
    if (isSearching && searchQuery.trim() !== '') displayedMessages = displayedMessages.filter(m => m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()));

    // --- LETREIROS DE FIXAÇÃO ---
    const globallyPinnedMessages = messages.filter(m => m.isPinnedGlobally);
    const latestGlobalPinned = globallyPinnedMessages.length > 0 ? globallyPinnedMessages[globallyPinnedMessages.length - 1] : null;

    const myPinnedMessages = messages.filter(m => m.pinnedBy?.includes(currentUser.uid));
    const latestPinned = myPinnedMessages.length > 0 ? myPinnedMessages[myPinnedMessages.length - 1] : null;

    const handleTextChange = (e) => {
        const val = e.target.value;
        setNewMessage(val);
        const cursor = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursor);
        const words = textBeforeCursor.split(' ');
        const currentWord = words[words.length - 1];

        if (currentWord.startsWith('@')) {
            const searchTerm = currentWord.slice(1).toLowerCase();
            const filtered = allUsers.filter(u => u.displayName && u.displayName.toLowerCase().replace(/\s+/g, '').includes(searchTerm));
            setFilteredUsers(filtered);
            setShowMentionMenu(true);
        } else {
            setShowMentionMenu(false);
        }
    };

    const handleMentionSelect = (user) => {
        const cursor = inputRef.current.selectionStart;
        const textBeforeCursor = newMessage.slice(0, cursor);
        const textAfterCursor = newMessage.slice(cursor);
        const words = textBeforeCursor.split(' ');
        words.pop();
        const mentionTag = `@${user.displayName.replace(/\s+/g, '')}`;
        const newTextBefore = words.join(' ') + (words.length > 0 ? ' ' : '') + mentionTag + ' ';
        setNewMessage(newTextBefore + textAfterCursor);
        setShowMentionMenu(false);
        inputRef.current.focus();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        await addDoc(collection(db, 'messages'), {
            text: newMessage,
            createdAt: serverTimestamp(),
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'DESENVOLVEDOR',
            photoURL: currentUser.photoURL,
            type: 'text',
            pinnedBy: [],
            favoritedBy: [],
            isPinnedGlobally: false
        });
        setNewMessage('');
        setShowEmojiPicker(false);
        setShowGifPicker(false);
        setShowMentionMenu(false);
    };

    const onGifClick = async (gif, e) => {
        e.preventDefault();
        await addDoc(collection(db, 'messages'), {
            gifUrl: gif.images.fixed_height.url,
            createdAt: serverTimestamp(),
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'DESENVOLVEDOR',
            photoURL: currentUser.photoURL,
            type: 'gif',
            pinnedBy: [],
            favoritedBy: [],
            isPinnedGlobally: false
        });
        setShowGifPicker(false);
    };

    const fetchGifsForGrid = (offset) => {
        if (gifSearchTerm) return giphyFetch.search(gifSearchTerm, { offset, limit: 10 });
        return giphyFetch.trending({ offset, limit: 10 });
    };

    const handleAvatarClick = async (uid) => {
        setShowUserModal(true); setLoadingUser(true);
        try {
            const userDocRef = doc(db, 'users', uid); const userDocSnap = await getDoc(userDocRef);
            const progressDocRef = doc(db, 'progress', uid); const progressDocSnap = await getDoc(progressDocRef);
            let userData = userDocSnap.exists() ? userDocSnap.data() : {};
            let lessonsCount = progressDocSnap.exists() ? Object.keys(progressDocSnap.data().lessons || {}).length : 0;
            const xpCalculado = lessonsCount * 150; const nivelCalculado = Math.floor(lessonsCount / 3) + 1;
            setSelectedUser({
                uid, displayName: userData.displayName || 'DEV. DESCONHECIDO', photoURL: userData.photoURL || userAvatarPlaceholder,
                status: userData.status || 'Active', lastProfileUpdate: userData.lastProfileUpdate || null, xp: xpCalculado, nivel: `V.${nivelCalculado}`, protocolos: lessonsCount
            });
        } catch (error) { console.error(error); setSelectedUser(null); } finally { setLoadingUser(false); }
    };

    const closeUserModal = () => { setShowUserModal(false); setTimeout(() => setSelectedUser(null), 300); };

    const renderMessageContent = (text) => {
        if (!text) return null;
        const words = text.split(' ');
        const formattedText = words.map((word, i) => {
            if (word.startsWith('@') && word.length > 1) {
                const isMeTagged = word === myMentionTag;
                return <strong key={i} className={`star-chat-mention ${isMeTagged ? 'mention-me' : ''}`}>{word} </strong>;
            }
            return word + ' ';
        });
        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const ytMatch = text.match(ytRegex);
        const audioRegex = /(https?:\/\/[^\s]+?\.(?:mp3|wav|ogg))/i;
        const audioMatch = text.match(audioRegex);

        let mediaElement = null;
        if (ytMatch && ytMatch[1]) { mediaElement = <iframe className="star-chat-media-iframe" src={`https://www.youtube.com/embed/${ytMatch[1]}`} frameBorder="0" allowFullScreen></iframe>; } 
        else if (audioMatch && audioMatch[1]) { mediaElement = <audio className="star-chat-media-audio" controls src={audioMatch[1]}></audio>; }
        return <><p>{formattedText}</p>{mediaElement}</>;
    };

    return (
        <div className="star-chat-wrapper">
            <div className="star-chat-bg-grid"></div>

            {/* --- MODAIS DE PERFIL E AJUDA (MANTIDOS IGUAIS) --- */}
            {showUserModal && (
                <div className="star-chat-modal-overlay" onClick={closeUserModal}>
                    <div className="star-chat-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="star-chat-modal-close" onClick={closeUserModal}><IoClose /></button>
                        {loadingUser ? (
                            <div className="star-chat-modal-loading"><i className="fas fa-circle-notch fa-spin"></i><p>ACESSANDO_REGISTROS...</p></div>
                        ) : selectedUser ? (
                            <div className="star-chat-profile-card">
                                <div className="profile-card-header">
                                    <img src={selectedUser.photoURL} alt="Avatar" className="profile-card-avatar" />
                                    <div className="profile-card-title">
                                        <h3>{selectedUser.displayName}</h3>
                                        <span className={`status-badge ${selectedUser.status === 'Active' ? 'active' : 'inactive'}`}>STATUS: {selectedUser.status?.toUpperCase() || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="profile-card-stats">
                                    <div className="stat-box"><span className="stat-label">TELEMETRIA (XP)</span><span className="stat-value">{selectedUser.xp.toLocaleString()}</span></div>
                                    <div className="stat-box"><span className="stat-label">NÍVEL ATUAL</span><span className="stat-value">{selectedUser.nivel}</span></div>
                                </div>
                                <div className="profile-card-details">
                                    <p><strong>ID:</strong> <span>{selectedUser.uid}</span></p>
                                    <p><strong>PROTOCOLOS DECODIFICADOS:</strong> <span>{selectedUser.protocolos}</span></p>
                                </div>
                            </div>
                        ) : (<div className="star-chat-modal-error"><p>DADOS_CORROMPIDOS_OU_NAO_ENCONTRADOS</p></div>)}
                    </div>
                </div>
            )}

            {showHelpModal && (
                <div className="star-chat-modal-overlay help-overlay" onClick={() => setShowHelpModal(false)}>
                    <div className="star-chat-modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="star-chat-modal-close" onClick={() => setShowHelpModal(false)}><IoClose /></button>
                        <div className="star-chat-profile-card">
                            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px', color: '#fff' }}><IoTerminalOutline style={{ marginRight: '10px' }}/> GUIA DE COMUNICAÇÃO</h3>
                            <ul className="star-chat-help-list">
                                <li><strong>MARCAÇÃO DE USUÁRIO:</strong> Digite <strong>@nome_do_usuario</strong> para destacar um desenvolvedor.</li>
                                <li><strong>INCORPORAR MÍDIA:</strong> Cole links do <strong>YouTube</strong> ou de arquivos de áudio (.mp3, .wav).</li>
                                <li><strong>AÇÕES:</strong> Passe o mouse sobre as mensagens para revelar o menu de ações:</li>
                                <li><strong>⭐ FAVORITAR:</strong> Salva a mensagem apenas para você.</li>
                                <li><strong>📌 FIXAR (PESSOAL):</strong> Fixa a mensagem no topo apenas na SUA tela.</li>
                                <li><strong>📢 FIXAR PARA TODOS:</strong> Fixa a mensagem no topo da tela de TODOS os usuários como um anúncio global.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="star-chat-panel">
                <div className="star-chat-header">
                    <div className="star-chat-header-left">
                      
                        <div className="star-chat-header-info">
                            <h2>COMUNICAÇÃO</h2>
                           
                        </div>
                    </div>
                    <div className="star-chat-header-meta" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className={`star-chat-search-box ${isSearching ? 'active' : ''}`}>
                            <IoSearchOutline className="search-icon" onClick={() => setIsSearching(!isSearching)} title="Pesquisar no chat" />
                            {isSearching && (<input type="text" placeholder="Buscar mensagem..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />)}
                        </div>
                        <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`star-chat-help-btn ${showFavoritesOnly ? 'active-fav' : ''}`} title="Mostrar apenas favoritos">
                            {showFavoritesOnly ? <IoStar style={{color: 'gold'}} /> : <IoStarOutline />}
                        </button>
                        <span>{messages.length} Menssagens</span>
                        <button type="button" onClick={() => setShowHelpModal(true)} className="star-chat-help-btn" title="Guia do Sistema"><IoHelpCircleOutline /></button>
                    </div>
                </div>

                {/* --- LETREIROS DE FIXAÇÃO --- */}
                {/* 1. ANÚNCIO GLOBAL (Prioridade e Cor Vermelha) */}
                {latestGlobalPinned && !isSearching && !showFavoritesOnly && (
                    <div className="star-chat-pinned-banner global-banner">
                        <IoMegaphone className="pin-icon" style={{color: '#ff4444'}} />
                        <div className="pinned-content">
                            <strong style={{color: '#ff4444'}}>ANÚNCIO GLOBAL ({latestGlobalPinned.displayName}): </strong>
                            <span>{latestGlobalPinned.text || "Mídia anexa"}</span>
                        </div>
                    </div>
                )}
                
                {/* 2. PINO PESSOAL (Cor Roxa) */}
                {latestPinned && !isSearching && !showFavoritesOnly && (
                    <div className="star-chat-pinned-banner">
                        <IoPin className="pin-icon" />
                        <div className="pinned-content">
                            <strong>FIXADO PARA VOCÊ: </strong>
                            <span>{latestPinned.text || "Mídia anexa"}</span>
                        </div>
                    </div>
                )}

                <div className="star-chat-messages">
                    {loading && <div className="star-chat-loading"><span className="star-chat-blink">SINCRONIZANDO_DADOS...</span></div>}

                    {!loading && displayedMessages.map((msg, index) => {
                        const isMe = msg.uid === currentUser.uid;
                        const isSequence = index > 0 && displayedMessages[index - 1].uid === msg.uid;
                        const amITagged = !isMe && msg.text && msg.text.includes(myMentionTag);
                        
                        const isMyFavorite = msg.favoritedBy?.includes(currentUser.uid);
                        const isMyPinned = msg.pinnedBy?.includes(currentUser.uid);
                        const isGlobalPinned = msg.isPinnedGlobally;

                        return (
                            <div key={msg.id} className={`star-chat-msg-group ${isMe ? 'is-me' : 'is-them'} ${isSequence ? 'is-seq' : ''}`}>
                                {!isMe && !isSequence && (
                                    <div className="star-chat-avatar-frame clickable" onClick={() => handleAvatarClick(msg.uid)}><img src={msg.photoURL || userAvatarPlaceholder} alt="" /></div>
                                )}
                                {!isMe && isSequence && <div className="star-chat-avatar-spacer" />}

                                <div className="star-chat-bubble-container">
                                    {!isMe && !isSequence && (<span className="star-chat-author clickable-text" onClick={() => handleAvatarClick(msg.uid)}>{msg.displayName}</span>)}

                                    <div className={`star-chat-bubble ${amITagged ? 'is-tagged' : ''} ${isMyPinned ? 'is-pinned-bubble' : ''} ${isGlobalPinned ? 'is-global-pinned-bubble' : ''}`}>
                                        
                                        <div className="msg-action-menu">
                                            <button onClick={() => toggleFavoriteMessage(msg.id, msg.favoritedBy)} title="Favoritar (Só pra mim)">
                                                {isMyFavorite ? <IoStar style={{color: 'gold'}} /> : <IoStarOutline />}
                                            </button>
                                            
                                            <button onClick={() => togglePinMessage(msg.id, msg.pinnedBy)} title="Fixar na minha tela (Só pra mim)">
                                                {isMyPinned ? <IoPin style={{color: 'blueviolet'}} /> : <IoPinOutline />}
                                            </button>
                                            
                                            <button onClick={() => toggleGlobalPinMessage(msg.id, isGlobalPinned)} title="Aviso Global (Fixar para TODOS)">
                                                {isGlobalPinned ? <IoMegaphone style={{color: '#ff4444'}} /> : <IoMegaphoneOutline />}
                                            </button>
                                            
                                            {isMe && (
                                                <button onClick={() => deleteMessage(msg.id)} title="Apagar para todos">
                                                    <IoTrashOutline style={{color: '#ff4444'}} />
                                                </button>
                                            )}
                                        </div>

                                        {amITagged && <div className="tagged-badge">VOCÊ FOI MENCIONADO</div>}
                                        {isGlobalPinned && <div className="pinned-badge global-badge"><IoMegaphone/> ANÚNCIO GLOBAL</div>}
                                        {isMyPinned && !isGlobalPinned && <div className="pinned-badge"><IoPin/> FIXADA PARA VOCÊ</div>}
                                        
                                        {msg.type === 'gif' ? (<img src={msg.gifUrl} alt="GIF" className="star-chat-gif" />) : (renderMessageContent(msg.text))}
                                        <span className="star-chat-time">{msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {displayedMessages.length === 0 && (isSearching || showFavoritesOnly) && (<div className="star-chat-loading">NENHUMA MENSAGEM ENCONTRADA.</div>)}
                    <div ref={messagesEndRef} />
                </div>

                <div className="star-chat-input-area">
                    {showMentionMenu && filteredUsers.length > 0 && (
                        <div className="star-chat-mention-menu">
                            <div className="mention-menu-header">MARCAR DESENVOLVEDOR</div>
                            {filteredUsers.map(user => (
                                <div key={user.uid} className="mention-menu-item" onClick={() => handleMentionSelect(user)}><img src={user.photoURL || userAvatarPlaceholder} alt="" /><span>{user.displayName}</span></div>
                            ))}
                        </div>
                    )}
                    {showEmojiPicker && <div className="star-chat-picker-floater"><EmojiPicker theme="dark" width={320} height={350} onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} /></div>}
                    {showGifPicker && (
                        <div className="star-chat-picker-floater star-chat-gif-picker">
                            <input type="text" placeholder="BUSCAR GIF..." className="star-chat-gif-search" onChange={(e) => setGifSearchTerm(e.target.value)} />
                            <div className="star-chat-gif-grid"><Grid width={300} columns={3} gutter={5} fetchGifs={fetchGifsForGrid} onGifClick={onGifClick} key={gifSearchTerm} /></div>
                        </div>
                    )}
                    <form className="star-chat-input-capsule" onSubmit={handleSendMessage}>
                        <div className="star-chat-tools">
                            <button type="button" className={`star-chat-tool-btn ${showEmojiPicker ? 'active' : ''}`} onClick={() => {setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowMentionMenu(false)}}><IoHappyOutline /></button>
                            <button type="button" className={`star-chat-tool-btn ${showGifPicker ? 'active' : ''}`} onClick={() => {setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowMentionMenu(false)}}><IoImageOutline /></button>
                        </div>
                        <input ref={inputRef} type="text" className="star-chat-main-input" placeholder="INSERIR COMANDO DE TEXTO (@ para marcar)..." value={newMessage} onChange={handleTextChange} />
                        <button type="submit" className="star-chat-send-btn" disabled={!newMessage.trim()}><IoSend /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;