// functions/index.js
const functions = require("firebase-functions");
const getMetaData = require("get-meta");

// Esta é uma "Callable Function", podemos chamá-la diretamente do nosso app React.
exports.getLinkPreview = functions.https.onCall(async (data, context) => {
  // Garante que o usuário está autenticado para usar a função.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Você precisa estar logado para usar esta função.",
    );
  }

  const url = data.url;
  if (!url) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A função precisa de uma URL.",
    );
  }

  try {
    // A biblioteca 'get-meta' busca a URL e extrai os metadados.
    const metadata = await getMetaData(url);
    // Retornamos os dados para o nosso app React.
    return {
      title: metadata.title,
      description: metadata.description,
      image: metadata.image || metadata.og.image,
      siteName: metadata.og.site_name || metadata.siteName,
      url: metadata.url,
    };
  } catch (error) {
    console.error("Erro ao buscar metadados:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Não foi possível obter os dados do link.",
    );
  }
});