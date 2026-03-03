import React from 'react';
import './LessonDescription.css';

const LessonDescription = ({ text }) => {
  if (!text) {
    return <p className="lesson-description-text">Descrição não disponível para esta aula.</p>;
  }

  // Marcador para identificar onde a lista começa (insensível a maiúsculas/minúsculas)
  const listMarker = /Extensões mostradas:/i;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Função para renderizar um pedaço de texto, convertendo URLs em links
  const renderTextWithLinks = (part) => {
    if (!part) return '';
    const segments = part.split(urlRegex);
    return segments.map((segment, i) => {
      if (segment.match(urlRegex)) {
        return (
          <a key={`link-${i}`} href={segment} target="_blank" rel="noopener noreferrer" className="lesson-link">
            {segment}
          </a>
        );
      }
      return segment;
    });
  };

  // Verifica se o texto contém o marcador da lista
  if (listMarker.test(text)) {
    const parts = text.split(listMarker);
    const introText = parts[0];
    const listText = parts[1];

    // Divide a lista em itens individuais pela quebra de linha e remove linhas vazias
    const listItems = listText.split('\n').filter(item => item.trim() !== '');

    return (
      <div className="lesson-description-text">
        <p>{renderTextWithLinks(introText)}</p>
        <p><strong>Extensões mostradas:</strong></p>
        <ul>
          {listItems.map((item, index) => {
            // Separa o nome da extensão e sua descrição
            const itemParts = item.split(' - ');
            const itemName = itemParts[0];
            const itemDesc = itemParts.slice(1).join(' - '); // Junta o resto da descrição

            return (
              <li key={index}>
                <strong>{itemName.trim()}</strong> - {renderTextWithLinks(itemDesc.trim())}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // Se não houver lista, apenas renderiza o texto com os links
  return (
    <p className="lesson-description-text">
      {renderTextWithLinks(text)}
    </p>
  );
};

export default LessonDescription;
