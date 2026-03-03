import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { IoHappyOutline, IoImageOutline, IoSend, IoChatbubblesSharp, IoEllipse } from 'react-icons/io5';
import userAvatarPlaceholder from '../../assets/images/user-avatar.png';

import './ChatPage.css';

// API Key Giphy (Use variável de ambiente em produção)
const giphyFetch = new GiphyFetch('UR0NoWFVVy7yoU1MXicNCVuMXqn5Ymxf');

const ChatPage = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearchTerm, setGifSearchTerm] = useState('');
    
    const messagesEndRef = useRef(null);

    // Scroll automático
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, showEmojiPicker, showGifPicker]);

    // Listener Realtime
    useEffect(() => {
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        await addDoc(collection(db, 'messages'), {
            text: newMessage,
            createdAt: serverTimestamp(),
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Dev',
            photoURL: currentUser.photoURL,
            type: 'text'
        });

        setNewMessage('');
        setShowEmojiPicker(false);
        setShowGifPicker(false);
    };

    const onGifClick = async (gif, e) => {
        e.preventDefault();
        await addDoc(collection(db, 'messages'), {
            gifUrl: gif.images.fixed_height.url,
            createdAt: serverTimestamp(),
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Dev',
            photoURL: currentUser.photoURL,
            type: 'gif'
        });
        setShowGifPicker(false);
    };

    const fetchGifsForGrid = (offset) => {
        if (gifSearchTerm) return giphyFetch.search(gifSearchTerm, { offset, limit: 10 });
        return giphyFetch.trending({ offset, limit: 10 });
    };

    return (
        <div className="chat-container-wrapper">
            {/* Background Glow */}
            <div className="chat-bg-glow"></div>

            <div className="chat-interface-panel">
                
                {/* --- HEADER --- */}
                <div className="chat-header">
                    <div className="header-left">
                        <div className="icon-box">
                            <IoChatbubblesSharp />
                        </div>
                        <div className="header-titles">
                            <h2>Comunidade DevQuest</h2>
                            <div className="live-badge">
                                <IoEllipse className="dot-pulse" />
                                <span>Canal Oficial</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-stats">
                        {messages.length} msgs
                    </div>
                </div>

                {/* --- MESSAGES AREA --- */}
                <div className="messages-scroll-area">
                    {loading && (
                        <div className="chat-loading">
                            <div className="spinner-dots"></div>
                        </div>
                    )}

                    {!loading && messages.map((msg, index) => {
                        const isMe = msg.uid === currentUser.uid;
                        // Verifica se a msg anterior é do mesmo usuário para agrupar visualmente
                        const isSequence = index > 0 && messages[index - 1].uid === msg.uid;

                        return (
                            <div key={msg.id} className={`message-group ${isMe ? 'my-message' : 'their-message'} ${isSequence ? 'sequence' : ''}`}>
                                
                                {!isMe && !isSequence && (
                                    <img 
                                        src={msg.photoURL || userAvatarPlaceholder} 
                                        alt="Avatar" 
                                        className="msg-avatar" 
                                    />
                                )}
                                {!isMe && isSequence && <div className="msg-avatar-placeholder" />}

                                <div className="msg-content-wrapper">
                                    {!isMe && !isSequence && (
                                        <span className="msg-author">{msg.displayName}</span>
                                    )}

                                    <div className="msg-bubble">
                                        {msg.type === 'gif' ? (
                                            <img src={msg.gifUrl} alt="GIF" className="gif-content" />
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                    </div>
                                    
                                    <span className="msg-timestamp">
                                        {msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* --- INPUT AREA --- */}
                <div className="input-area-wrapper">
                    
                    {/* Pickers Flutuantes */}
                    {showEmojiPicker && (
                        <div className="picker-floater emoji-floater">
                            <EmojiPicker theme="dark" width="100%" height={350} onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} />
                        </div>
                    )}
                    {showGifPicker && (
                        <div className="picker-floater gif-floater">
                            <input 
                                type="text" 
                                placeholder="Buscar GIF..." 
                                className="gif-search-input"
                                onChange={(e) => setGifSearchTerm(e.target.value)}
                            />
                            <div className="gif-scroll-view">
                                <Grid width={280} columns={3} gutter={5} fetchGifs={fetchGifsForGrid} onGifClick={onGifClick} key={gifSearchTerm} />
                            </div>
                        </div>
                    )}

                    <form className="input-capsule" onSubmit={handleSendMessage}>
                        <div className="input-tools">
                            <button type="button" className={`icon-btn ${showEmojiPicker ? 'active' : ''}`} onClick={() => {setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false)}}>
                                <IoHappyOutline />
                            </button>
                            <button type="button" className={`icon-btn ${showGifPicker ? 'active' : ''}`} onClick={() => {setShowGifPicker(!showGifPicker); setShowEmojiPicker(false)}}>
                                <IoImageOutline />
                            </button>
                        </div>
                        
                        <input 
                            type="text" 
                            className="main-input"
                            placeholder="Enviar mensagem para a turma..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        
                        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                            <IoSend />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ChatPage;