const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// ==========================================
// MIDDLEWARES GLOBAUX DE SÉCURITÉ & PARSING
// ==========================================

// Configuration de Helmet pour sécuriser les en-têtes HTTP de l'admin web
app.use(helmet({
    contentSecurityPolicy: false, // À ajuster plus tard si des scripts externes bloquent sur l'UI admin
}));

// Activation du CORS (Utile si ton panel admin communique avec une autre origine)
app.use(cors());

// Intercepteurs de requêtes (Crucial pour capter les webhooks JSON de Notify)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// CONFIGURATION DU MOTEUR DE RENDU (Pôle Média)
// ==========================================
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./src/public'));

// ==========================================
// ROUTE DE VÉRIFICATION OPÉRATIONNELLE (Healthcheck)
// ==========================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        env: process.env.NODE_ENV
    });
});

// ==========================================
// ZONES D'INJECTION DES ACCÈS FUTURS
// ==========================================
// app.use('/webhook', whatsappRouter);
// app.use('/admin', adminRouter);

// Gestion globale des erreurs 404 (Route non trouvée)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ressource introuvable sur le serveur ICC-IA' });
});

module.exports = app;