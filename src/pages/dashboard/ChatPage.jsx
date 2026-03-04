import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { IoHappyOutline, IoImageOutline, IoSend, IoEllipse, IoTerminalOutline } from 'react-icons/io5';
import userAvatarPlaceholder from '../../assets/images/user-avatar.png';

import './ChatPage.css';

// Lembre-se de mover esta chave para variáveis de ambiente depois!
const giphyFetch = new GiphyFetch('UR0NoWFVVy7yoU1MXicNCVuMXqn5Ymxf');

const ChatPage = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearchTerm, setGifSearchTerm] = useState('');
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, showEmojiPicker, showGifPicker]);

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
            displayName: currentUser.displayName || 'OPERADOR',
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
            displayName: currentUser.displayName || 'OPERADOR',
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
        <div className="star-chat-wrapper">
            <div className="star-chat-bg-grid"></div>

            <div className="star-chat-panel">
                
                {/* --- HEADER --- */}
                <div className="star-chat-header">
                    <div className="star-chat-header-left">
                        <div className="star-chat-status-icon">
                            <IoTerminalOutline />
                        </div>
                        <div className="star-chat-header-info">
                            <h2>COMUNIDADE_DEV_QUEST</h2>
                            <div className="star-chat-live-status">
                                <IoEllipse className="star-chat-dot" />
                                <span>LINK_ATIVO // CANAL_OFICIAL</span>
                            </div>
                        </div>
                    </div>
                    <div className="star-chat-header-meta">
                        {messages.length} PKTS_DATA
                    </div>
                </div>

                {/* --- MESSAGES AREA --- */}
                <div className="star-chat-messages">
                    {loading && (
                        <div className="star-chat-loading">
                            <span className="star-chat-blink">SINCRONIZANDO_DADOS...</span>
                        </div>
                    )}

                    {!loading && messages.map((msg, index) => {
                        const isMe = msg.uid === currentUser.uid;
                        const isSequence = index > 0 && messages[index - 1].uid === msg.uid;

                        return (
                            <div key={msg.id} className={`star-chat-msg-group ${isMe ? 'is-me' : 'is-them'} ${isSequence ? 'is-seq' : ''}`}>
                                
                                {!isMe && !isSequence && (
                                    <div className="star-chat-avatar-frame">
                                        <img src={msg.photoURL || userAvatarPlaceholder} alt="" />
                                    </div>
                                )}
                                {!isMe && isSequence && <div className="star-chat-avatar-spacer" />}

                                <div className="star-chat-bubble-container">
                                    {!isMe && !isSequence && (
                                        <span className="star-chat-author">{msg.displayName}</span>
                                    )}

                                    <div className="star-chat-bubble">
                                        {msg.type === 'gif' ? (
                                            <img src={msg.gifUrl} alt="GIF" className="star-chat-gif" />
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                        <span className="star-chat-time">
                                            {msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* --- INPUT AREA --- */}
                <div className="star-chat-input-area">
                    
                    {showEmojiPicker && (
                        <div className="star-chat-picker-floater">
                            <EmojiPicker theme="dark" width={320} height={350} onEmojiClick={(e) => setNewMessage(p => p + e.emoji)} />
                        </div>
                    )}
                    {showGifPicker && (
                        <div className="star-chat-picker-floater star-chat-gif-picker">
                            <input 
                                type="text" 
                                placeholder="BUSCAR GIF..." 
                                className="star-chat-gif-search"
                                onChange={(e) => setGifSearchTerm(e.target.value)}
                            />
                            <div className="star-chat-gif-grid">
                                <Grid width={300} columns={3} gutter={5} fetchGifs={fetchGifsForGrid} onGifClick={onGifClick} key={gifSearchTerm} />
                            </div>
                        </div>
                    )}

                    <form className="star-chat-input-capsule" onSubmit={handleSendMessage}>
                        <div className="star-chat-tools">
                            <button type="button" className={`star-chat-tool-btn ${showEmojiPicker ? 'active' : ''}`} onClick={() => {setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false)}}>
                                <IoHappyOutline />
                            </button>
                            <button type="button" className={`star-chat-tool-btn ${showGifPicker ? 'active' : ''}`} onClick={() => {setShowGifPicker(!showGifPicker); setShowEmojiPicker(false)}}>
                                <IoImageOutline />
                            </button>
                        </div>
                        
                        <input 
                            type="text" 
                            className="star-chat-main-input"
                            placeholder="INSERIR COMANDO DE TEXTO..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        
                        <button type="submit" className="star-chat-send-btn" disabled={!newMessage.trim()}>
                            <IoSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;