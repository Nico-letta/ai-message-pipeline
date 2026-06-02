require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

/**
 * Initialisation et démarrage du serveur de l'église I.C.C
 */
async function startServer() {
    try {
        // C'est ici que nous intégrerons l'initialisation des pools d'infrastructures :
        // await db.connect();      -> Connexion pool MySQL
        // await redis.connect();   -> Connexion Redis pour BullMQ
        const currentEnv = process.env.NODE_ENV || 'development';
        
        app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(` SERVEUR ICC-IA DEMARRÉ EN MODE [${currentEnv.toUpperCase()}]`);
            console.log(` Port d'écoute : ${PORT}`);
            console.log(` Vérification d'état : http://localhost:${PORT}/health`);
            console.log(`=======================================================`);
        });
    } catch (error) {
        console.error(' Échec critique lors du bootstrapping du serveur :', error);
        process.exit(1); // Arrêt immédiat du processus en cas de panne d'infrastructure
    }
}

startServer();