// src/components/chat/ChatMessage.jsx

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ChatMessage = ({ message, isCurrentUser }) => {
    const { userName, userAvatar, content = '', createdAt, gifUrl, videoUrl, imageUrl } = message;
    const videoRef = useRef(null);

    // Lógica para HLS (vídeos .m3u8)
    const isM3U8 = videoUrl && videoUrl.endsWith('.m3u8');
    useEffect(() => {
        if (isM3U8 && videoRef.current) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(videoRef.current);
                return () => hls.destroy();
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = videoUrl;
            }
        }
    }, [videoUrl, isM3U8]);
    
    // Lógica para vídeos do YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = content.match(youtubeRegex);

    return (
        <div className={`chat-message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
            <img src={userAvatar} alt={userName} className="message-avatar" />
            <div className="message-body">
                <div className="message-author">
                    <strong>{userName}</strong>
                    <span className="message-timestamp">{formatTimestamp(createdAt)}</span>
                </div>
                {content && <div className="message-bubble">{content}</div>}
                
                {/* Renderização de Imagem de Anexo */}
                {imageUrl && (
                    <div className="message-image-wrapper">
                        <img src={imageUrl} alt="Imagem enviada" className="message-image" />
                    </div>
                )}
                
                {/* ✅ LÓGICA ATUALIZADA PARA RENDERIZAR GIFS E VÍDEOS-GIFS (MP4) */}
                {gifUrl && (
                    <div className="message-gif-wrapper">
                        {/* Se a URL for um vídeo .mp4, renderiza como vídeo. Senão, como imagem. */}
                        {gifUrl.endsWith('.mp4') ? (
                            <video 
                                src={gifUrl} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="message-gif-video"
                            />
                        ) : (
                            <img src={gifUrl} alt="GIF" className="message-gif" />
                        )}
                    </div>
                )}
                
                {/* Renderização de Vídeos (YouTube, m3u8, etc.) */}
                {youtubeMatch ? (
                    <div className="message-media-wrapper">
                        <iframe src={`https://www.youtube.com/embed/${youtubeMatch[1]}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                ) : isM3U8 ? (
                    <div className="message-media-wrapper">
                        <video ref={videoRef} controls></video>
                    </div>
                ) : videoUrl && (
                    <div className="message-media-wrapper">
                        <video src={videoUrl} controls></video>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;