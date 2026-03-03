import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
// Importamos collectionGroup para buscar subcoleções
import { collection, getDocs, collectionGroup } from 'firebase/firestore'; 
import { IoSearch, IoClose, IoPlayCircle, IoLayers, IoBook, IoRocketOutline } from 'react-icons/io5';
import './SearchPage.css';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [allData, setAllData] = useState([]); // Guarda tudo (Cursos + Módulos)
  const [results, setResults] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // 1. BUSCAR DADOS DO FIREBASE (Mapeando PT -> EN)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const contentList = [];

        // --- A. BUSCAR CURSOS ---
        const cursosRef = collection(db, 'cursos'); // Nome exato no seu banco
        const cursosSnap = await getDocs(cursosRef);
        
        cursosSnap.forEach(doc => {
          const data = doc.data();
          contentList.push({
            id: doc.id,
            type: 'course', // Define o tipo para o filtro
            // Mapeamento: Seu Banco (PT) -> Componente (EN)
            title: data.titulo || 'Sem Título',
            image: data.imagemUrl || DEFAULT_COVER,
            category: data.tipo || 'Geral', 
            description: data.descricao || '',
            // Guardamos o ID original para links
            originalId: doc.id 
          });
        });

        // --- B. BUSCAR MÓDULOS (Collection Group Query) ---
        // Isso busca TODOS os documentos chamados 'modulos' dentro de qualquer curso
        const modulosQuery = collectionGroup(db, 'modulos'); 
        const modulosSnap = await getDocs(modulosQuery);

        modulosSnap.forEach(doc => {
          const data = doc.data();
          // O parent.parent.id pega o ID do Curso dono deste módulo
          const parentCourseId = doc.ref.parent.parent ? doc.ref.parent.parent.id : null;

          contentList.push({
            id: doc.id,
            type: 'module',
            title: data.titulo || 'Módulo sem nome',
            image: data.imagemUrl || DEFAULT_COVER,
            category: 'Módulo',
            parentCourseId: parentCourseId // Importante para o link funcionar
          });
        });

        setAllData(contentList);
        setResults(contentList.slice(0, 10)); // Exibe 10 iniciais

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. FILTRAGEM NO CLIENTE (Rápida)
  useEffect(() => {
    if (isLoading) return;
    setIsSearching(true);

    const timer = setTimeout(() => {
      let filtered = allData;

      // Filtro de Texto
      if (query.trim() !== '') {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery)
        );
      }

      // Filtro de Tipo (Abas)
      if (activeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === activeFilter);
      }

      setResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilter, allData, isLoading]);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'course': return <IoBook />;
      case 'module': return <IoLayers />;
      case 'lesson': return <IoPlayCircle />;
      default: return <IoRocketOutline />;
    }
  };

  // Helper para gerar o link correto
  const getLink = (item) => {
    if (item.type === 'course') {
        return `/cursos/${item.id}`;
    } 
    if (item.type === 'module') {
        // Se for módulo, manda para o curso pai, ou para uma rota de módulo se tiver
        return `/cursos/${item.parentCourseId}`; 
    }
    return '#';
  };

  return (
    <div className="search-page-wrapper">
      <div className="search-ambient-glow"></div>

      <div className="search-container">
        
        {/* HEADER DA BUSCA */}
        <div className="search-header">
          <div className="input-hero-wrapper">
            <IoSearch className="search-icon-lg" />
            <input 
              type="text" 
              className="search-input-hero"
              placeholder="Busque por cursos, módulos ou aulas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="btn-clear" onClick={() => setQuery('')}>
                <IoClose />
              </button>
            )}
          </div>

          <div className="filter-pills-row">
            {['all', 'course', 'module'].map((filter) => (
              <button 
                key={filter}
                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'Tudo' : 
                 filter === 'course' ? 'Cursos' : 
                 filter === 'module' ? 'Módulos' : 'Aulas'}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="search-results-area">
          
          {(isLoading || isSearching) && (
            <div className="loading-grid">
              {[1,2,3,4].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
          )}

          {!isLoading && !isSearching && results.length === 0 && (
            <div className="no-results-state">
              <h2>Nenhum resultado encontrado</h2>
              <p>Verifique a ortografia ou tente termos gerais como "Front-End".</p>
            </div>
          )}

          {!isLoading && !isSearching && results.length > 0 && (
            <div className="results-grid">
              {results.map(item => (
                <Link to={getLink(item)} key={item.id} className="result-card">
                  <div className="card-image-wrapper">
                    <img src={item.image} alt={item.title} onError={(e) => e.target.src = DEFAULT_COVER} />
                    <div className="card-overlay">
                      <div className="play-btn-overlay"><IoPlayCircle /></div>
                    </div>
                    <div className="type-badge">
                      {getTypeIcon(item.type)} {item.type === 'module' ? 'Módulo' : 'Curso'}
                    </div>
                  </div>
                  <div className="card-info">
                    <h4>{item.title}</h4>
                    <span className="category-text">{item.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPage;