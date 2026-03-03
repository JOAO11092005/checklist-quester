// bot/bot.cjs - Apenas a seção messageCreate está atualizada.

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const admin = require('firebase-admin');

// --- CONFIGURAÇÃO ---
const SERVICE_ACCOUNT = require('./firebase-credentials.json');
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// --- INICIALIZAÇÃO ---
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});
const db = admin.firestore();
console.log('[INFO] Conectado ao Firebase com sucesso.');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


// --- LÓGICA DO BOT ---

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CHANNEL_ID) return;

  console.log(`[DISCORD -> FIREBASE] Mensagem recebida de "${message.author.username}"`);

  const messagePayload = {
    content: message.content,
    gifUrl: null,
    imageUrl: null, 
    userName: message.author.username,
    userAvatar: message.author.displayAvatarURL(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'discord',
  };

  // 1. VERIFICA SE HÁ ANEXOS (UPLOADS DE ARQUIVO)
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    // Verifica se o anexo é um GIF animado ou uma imagem estática
    if (attachment.contentType?.startsWith('image/gif')) {
      messagePayload.gifUrl = attachment.url;
    } else if (attachment.contentType?.startsWith('image/')) {
      messagePayload.imageUrl = attachment.url;
    }
  
  // 2. SE NÃO HÁ ANEXOS, VERIFICA SE HÁ EMBEDS (LINKS DE GIF/IMAGEM)
  } else if (message.embeds.length > 0) {
    const embed = message.embeds[0];
    
    // ✅ CORREÇÃO PARA GIFS DO DISCORD (Tenor/Giphy)
    if (embed.provider && (embed.provider.name === 'Tenor' || embed.provider.name === 'Giphy')) {
        // Para Tenor/Giphy, o GIF animado REAL costuma estar em `embed.video.url`
        // ou às vezes em `embed.thumbnail.proxyURL` ou `embed.image.proxyURL`
        messagePayload.gifUrl = embed.video?.url || embed.image?.proxyURL || embed.thumbnail?.proxyURL || embed.image?.url || embed.thumbnail?.url;
        messagePayload.content = ''; // Limpa o conteúdo original que seria o link do Tenor
    } 
    // Outros tipos de embeds de imagem (links diretos que o Discord transforma em embed)
    else if (embed.type === 'image' && embed.url) {
        // Se for um embed de imagem direta, use a URL
        messagePayload.imageUrl = embed.url;
        messagePayload.content = '';
    }
  }

  // 3. SE NÃO FOR NENHUM DOS ANTERIORES, É SÓ TEXTO (já está em messagePayload.content)

  try {
    await db.collection('doubts').add(messagePayload);
    console.log(`[DISCORD -> FIREBASE] Mensagem salva.`, messagePayload);
  } catch (error) {
    console.error('ERRO ao salvar no Firebase:', error);
  }
});


// ... (O resto do código para ouvir o Firebase e fazer o login do bot continua o mesmo)
const doubtsCollection = db.collection('doubts').orderBy('createdAt');
let initialLoadDone = false;
console.log('[INFO] Preparando para ouvir a coleção "doubts" no Firebase...');
doubtsCollection.onSnapshot(snapshot => {
    if (!initialLoadDone) {
        console.log("[INFO] Carga inicial do Firebase concluída. Aguardando novas mensagens...");
        initialLoadDone = true; return;
    }
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const messageData = change.doc.data();
            if (!messageData.source || messageData.source !== 'webapp') return;
            client.channels.fetch(CHANNEL_ID)
                .then(channel => {
                    // Decide o que enviar: GIF, Imagem ou Texto
                    if (messageData.gifUrl) {
                        channel.send(messageData.gifUrl);
                    } else if (messageData.imageUrl) {
                        channel.send(messageData.imageUrl); // Envia o link da imagem como anexo no Discord
                    }
                    else {
                        channel.send(`**${messageData.userName}**: ${messageData.content}`);
                    }
                })
                .catch(err => console.error("ERRO ao enviar para o Discord:", err));
        }
    });
}, err => console.error('ERRO CRÍTICO no listener do Firebase:', err));

client.login(DISCORD_TOKEN)
  .then(() => console.log(`[SUCESSO] Bot conectado ao Discord como ${client.user.tag}!`))
  .catch(err => console.error("ERRO CRÍTICO ao fazer login no Discord:", err));