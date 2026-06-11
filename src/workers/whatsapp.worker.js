const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const prisma = require('../config/db');
// 1. Importation du service Ollama
const { generateResponse } = require('../services/ollama.service');
const { sendWhatsAppMessage } = require('../services/notify.service');

console.log(' Le Worker WhatsApp ICC-IA a été réveillé et guette la file...');

// 2. Définition des prompts systèmes selon le statut (Extensible plus tard)
// const SYSTEM_PROMPTS = {
//     VISITEUR: `Tu es l'assistant virtuel officiel de notre communauté chrétienne. 
// Tu réponds de manière très chaleureuse, respectueuse et encourageante. 
// Cet utilisateur est un VISITEUR : sois particulièrement accueillant, invite-le à découvrir nos cultes et nos activités avec douceur. 
// Fais des réponses courtes, directes et adaptées à un message WhatsApp.`,
//     MEMBRE: `Tu es l'assistant virtuel officiel de notre communauté chrétienne. 
// Cet utilisateur est un MEMBRE enregistré. Tu peux lui donner des détails sur les réunions internes et la vie de la communauté.`
// };

const whatsappWorker = new Worker('whatsapp-queue', async (job) => {
    const { from, text } = job.data;

    console.log(`\n [Worker] Traitement du job #${job.id} en cours...`);
    console.log(` Expéditeur (whatsappId) : ${from}`);
    console.log(` Contenu : "${text}"`);

    try {
        // 1. Récupérer ou créer l'utilisateur dans la table 'users'
        let user = await prisma.user.upsert({
            where: { whatsappId: from },
            update: {},
            create: {
                whatsappId: from,
                statut: 'VISITEUR'
            }
        });

        console.log(` Utilisateur identifié : ID ${user.id} | Statut : ${user.statut}`);

        // 2. Enregistrer le message reçu dans la table 'message_logs'
        const savedMessage = await prisma.messageLog.create({
            data: {
                userId: user.id,
                role: 'user',
                content: text
            }
        });

        console.log(` Message enregistré en BDD avec l'ID : ${savedMessage.id}`);

        // 3. Récupérer l'historique récent pour donner de la mémoire à l'IA
        const rawHistory = await prisma.messageLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const conversationHistory = rawHistory.reverse().map(log => ({
            role: log.role,
            content: log.content
        }));

        console.log(` Mémoire chargée : ${conversationHistory.length} messages récupérés pour le contexte.`);

        //  4. Récupération dynamique du prompt système en BDD selon le statut du fidèle
        console.log(` [Worker] Recherche du prompt système pour le statut : ${user.statut}...`);
        
        const systemPromptRecord = await prisma.systemPrompt.findUnique({
            where: { statut: user.statut }
        });

        // Sécurité : Si aucun prompt n'est configuré en BDD pour ce statut, on utilise un prompt de secours
        const currentPrompt = systemPromptRecord ? systemPromptRecord.content : `Tu es l'assistant de notre communauté chrétienne. Sois accueillant et poli.`;
        
        // On lance l'inférence locale avec le prompt de la BDD
        const aiResponse = await generateResponse(conversationHistory, currentPrompt);
        
        console.log(`\n [Qwen2.5] Réponse générée depuis le prompt BDD :`);
        console.log(` "${aiResponse}"\n`);

        //  5. Enregistrer la réponse de l'IA dans la table 'message_logs' (Mémoire de l'assistant)
        const savedAssistantMessage = await prisma.messageLog.create({
            data: {
                userId: user.id,
                role: 'assistant', //  Très important : c'est ce qui indique à l'historique que c'est l'IA qui parle
                content: aiResponse
            }
        });

        console.log(` Réponse de l'IA enregistrée en BDD avec l'ID : ${savedAssistantMessage.id}`);

        await sendWhatsAppMessage(from, aiResponse);

        console.log(` [Worker] Job #${job.id} traité avec succès !`);

    } catch (error) {
        console.error(` [Worker] Échec de traitement pour le job #${job.id} :`, error);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 1
});

module.exports = whatsappWorker;