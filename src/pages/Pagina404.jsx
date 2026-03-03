// src/pages/Pagina404.jsx

import { Link, useRouteError } from 'react-router-dom';
import './Pagina404.css'; // O mesmo nome de arquivo, mas com o novo conteúdo abaixo

function Pagina404() {
  const error = useRouteError();
  console.error(error);

  return (
    // A classe principal agora define o tema dark
    <main className="container-404-dk">
      <div className="content-404-dk">

        {/* O '404' agora é o herói visual da página */}
        <h1 className="title-404-dk">
          4<span className="zero-portal-dk">0</span>4
        </h1>

        <h2>PÁGINA NÃO ENCONTRADA</h2>
        <p className="message-404-dk">
          Oops! Parece que você navegou para uma coordenada desconhecida no nosso universo digital.
        </p>

        {/* Exibe o erro técnico de forma discreta */}
        <p className="error-details-dk">
          <i>{error?.statusText || error?.message}</i>
        </p>

        <Link to="/" className="button-back-dk">
          RETORNAR À BASE
        </Link>
      </div>
    </main>
  );
}

export default Pagina404;