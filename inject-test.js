// inject-test.js
const { Queue } = require('bullmq');
const { redisConnection } = require('./src/config/queue');

const whatsappQueue = new Queue('whatsapp-queue', { connection: redisConnection });

async function injectTestJob() {
    console.log(" Injection directe du job de test 'Salut Zeno'...");
    
    await whatsappQueue.add('whatsapp-job', { 
        from: "242064149079", 
        text: "Salut Zeno",
        name: "Nicoletta"
    });

    console.log(" Opération réussie ! Le job est dans la file.");
    process.exit(0);
}

injectTestJob().catch(err => {
    console.error(" Erreur :", err);
    process.exit(1);
});