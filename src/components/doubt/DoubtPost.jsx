// src/components/doubt/DoubtPost.jsx
import React, { useMemo } from 'react';
// Não precisamos mais do ReactPlayer
import userAvatarPlaceholder from '../../assets/images/user-avatar.png';

// --- FUNÇÃO AUXILIAR PARA CONVERTER LINKS DE VÍDEO ---
const getVideoEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  let videoId;
  
  // Tenta extrair o ID de um link padrão do YouTube (youtube.com/watch?v=...)
  const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    videoId = youtubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Tenta extrair o ID de um link curto do YouTube (youtu.be/...)
  const shortYoutubeMatch = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortYoutubeMatch) {
    videoId = shortYoutubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Se for um link direto de MP4 ou M3U8, retorna ele mesmo
  if (url.endsWith('.mp4') || url.endsWith('.m3u8')) {
    return url;
  }
  
  // Se não for nenhum dos formatos conhecidos, retorna nulo
  return null;
};
// --- FIM DA FUNÇÃO AUXILIAR ---


const DoubtPost = ({ doubt }) => {

  const embedUrl = useMemo(() => {
    // A lógica agora é simples: apenas chama nossa função auxiliar
    let urlToTest = doubt.videoUrl || doubt.linkPreviewData?.url || doubt.content;
    return getVideoEmbedUrl(urlToTest);
  }, [doubt]);

  if (!doubt.content && !doubt.videoUrl && !doubt.linkPreviewData) {
    return null;
  }

  return (
    <div className="doubt-post">
      <div className="post-author">
        <img src={doubt.userAvatar || userAvatarPlaceholder} alt={doubt.userName} />
        <div className="author-info">
          <strong>{doubt.userName}</strong>
          <span className="post-timestamp">{doubt.createdAt?.toDate().toLocaleString()}</span>
        </div>
      </div>
      
      {doubt.content && <p className="post-content">{doubt.content}</p>}

      {/* ✅ ALTERAÇÃO AQUI: Usando <iframe> para todos os vídeos */}
      {embedUrl && (
        <div className="post-video-wrapper">
          <iframe
            src={embedUrl}
            title={`Vídeo do post de ${doubt.userName}`}
            frameBorder="0"
            allow="accelerometer;  clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* O preview de link só aparece se não houver um vídeo */}
      {!embedUrl && doubt.linkPreviewData && (
        <div className="post-link-preview">
          <a href={doubt.linkPreviewData.url} target="_blank" rel="noopener noreferrer">
            {doubt.linkPreviewData.image && <img src={doubt.linkPreviewData.image} alt="Preview" />}
            <div className="link-preview-info">
              <strong>{doubt.linkPreviewData.siteName || 'Link'}</strong>
              <h5>{doubt.linkPreviewData.title}</h5>
              <p>{doubt.linkPreviewData.description}</p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default DoubtPost;