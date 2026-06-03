const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');

console.log(' Le Worker WhatsApp a été réveillé et guette la file...');

/**
 * Initialisation du Worker pour traiter les messages de 'whatsapp-queue'
 */
const whatsappWorker = new Worker('whatsapp-queue', async (job) => {
    // Cette fonction s'exécute automatiquement dès qu'un message arrive dans la file
    const { from, text, timestamp } = job.data;

    console.log(`\n [Worker] Traitement du job #${job.id} en cours...`);
    console.log(` Expéditeur : ${from}`);
    console.log(` Contenu : "${text}"`);
    console.log(` Reçu le : ${new Date(timestamp).toLocaleTimeString()}`);

    try {
        // =================================================================
        // C'est ICI que s'exécutera le futur pipeline lourd :
        // 1. Appeler Prisma pour récupérer ou créer le profil du fidèle
        // 2. Interroger l'IA (Qwen) avec le contexte adapté
        // 3. Envoyer la réponse finale au fidèle via l'API de Notify
        // =================================================================
        
        // Simulation d'une tâche lourde (ex: attente de la réponse de l'IA)
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        console.log(` [Worker] Tâche terminée avec succès pour le job #${job.id} !`);
    } catch (error) {
        console.error(` [Worker] Échec de traitement pour le job #${job.id} :`, error);
        throw error; // Permet à BullMQ de savoir que le job a échoué pour tenter un retry
    }
}, {
    connection: redisConnection,
    concurrency: 1 // Traite 1 message à la fois par défaut pour ne pas surcharger l'IA
});

module.exports = whatsappWorker;