// src/data/mockData.js

export const courses = [
  { 
    id: 'devquest-exemplo',
    title: 'DevQuest Frontend (Exemplo)', 
    image: 'https://placehold.co/600x400/8A2BE2/FFFFFF?text=Curso+Frontend',
    modules: [
      { 
        id: 'm-sup', 
        title: 'Suporte', 
        lessons: Array.from({ length: 18 }, (_, i) => ({
          id: `l-sup-${i + 1}`,
          title: `${i + 1}. Aula de Suporte`,
          videoUrl: 'https://drive.google.com/file/d/1JT3XVj0bIICD9ZQJobm5nfLtw55Vvphy/preview',
          completed: false,
        })),
      },
      { 
        id: 'm-intro', 
        title: 'Introdução (NÃO PULE!)', 
        lessons: [
          { id: 'l1', title: '1. Recados importantes     edededededededededededed', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l2', title: '2. Bem Vindo(a) ao DevQuest!', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l3', title: '3. Introdução aos 3 pilares', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l4', title: '4. O pilar do planejamento', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l5', title: '5. O pilar da prática', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l6', title: '6. O pilar do Marketing Pessoal', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l7', title: '7. Convocação da Guilda DevQuest', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
          { id: 'l8', title: '8. Tutorial Notion', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: true },
        ]
      },
      { 
        id: 'm-plan', 
        title: 'Planejando a jornada', 
        lessons: Array.from({ length: 5 }, (_, i) => ({
          id: `l-plan-${i + 1}`,
          title: `${i + 1}. Aula de Planejamento`,
          videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo',
          completed: false,
        })),
      },
      { 
        id: 'm-term', 
        title: 'Usando terminal', 
        lessons: Array.from({ length: 9 }, (_, i) => ({
          id: `l-term-${i + 1}`,
          title: `${i + 1}. Aula de Terminal`,
          videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo',
          completed: false,
        })),
      },
      { 
        id: 'm-vs', 
        title: 'Conhecendo o VS Code', 
        lessons: [
          { id: 'l-vs-1', title: '1. Aula de VS Code', videoUrl: 'https://www.youtube.com/embed/S9uPNppGsGo', completed: false },
        ]
      },
    ]
  },
];
