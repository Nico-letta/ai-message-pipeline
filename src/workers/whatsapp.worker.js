const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const prisma = require('../config/db');

console.log(' Le Worker WhatsApp a été réveillé et guette la file...');

const whatsappWorker = new Worker('whatsapp-queue', async (job) => {
    // Nettoyage : On ne récupère que les données essentielles dont on est sûr
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
        // On laisse MySQL gérer automatiquement le champ 'createdAt' grâce au @default(now()) du schéma
        const savedMessage = await prisma.messageLog.create({
            data: {
                userId: user.id,
                role: 'user',
                content: text
            }
        });

        console.log(` Message enregistré en BDD avec l'ID : ${savedMessage.id}`);

        // 3. Récupérer l'historique récent pour donner de la mémoire à l'IA
        // On prend les 10 derniers messages, triés par date ascendante pour Qwen
        const rawHistory = await prisma.messageLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // On remet dans l'ordre chronologique (le plus vieux au plus récent)
        const conversationHistory = rawHistory.reverse().map(log => ({
            role: log.role, // 'user' ou 'assistant'
            content: log.content
        }));

        console.log(` Mémoire chargée : ${conversationHistory.length} messages récupérés pour le contexte.`);

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