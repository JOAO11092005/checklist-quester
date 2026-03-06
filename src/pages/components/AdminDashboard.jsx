import React from 'react';

const AdminDashboard = () => {
  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-card">
        <h3>Manual de Operação do Sistema</h3>
        <p style={{color: '#888', lineHeight: '1.6'}}>
          Bem-vindo à central de comando. Este sistema opera sob uma arquitetura de aprendizado em etapas. 
          Inicie criando uma <strong>Trilha</strong> e defina sua categoria (FRONT-END ou BACK-END).<br/>
          Em seguida, acople os <strong>Módulos</strong> à trilha. Por fim, injete as <strong>Transmissões de Vídeo</strong> dentro dos módulos.
        </p>
        <div className="video-container" style={{marginTop: '20px'}}>
          <iframe src="https://back-end-nexora.vercel.app/embed/fe25md438d8ge9br6l17pl" allowFullScreen></iframe>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;