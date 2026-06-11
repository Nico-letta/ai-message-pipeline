const { Queue } = require('bullmq');
const { redisConnection } = require('./src/config/queue');

const queue = new Queue('whatsapp-queue', { connection: redisConnection });

async function clearQueue() {
    console.log(" Nettoyage de la file d'attente BullMQ...");
    await queue.drain(true);
    await queue.obliterate({ force: true });
    console.log(" File d'attente entièrement vidée !");
    process.exit(0);
}

clearQueue().catch(err => {
    console.error(err);
    process.exit(1);
});