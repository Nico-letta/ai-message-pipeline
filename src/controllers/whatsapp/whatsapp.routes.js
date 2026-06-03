const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp.controller');
const { validateWebhookSecret } = require('../../middlewares/auth.middleware');

// Déclaration de la route POST pour la réception des messages
router.post('/', validateWebhookSecret, whatsappController.handleIncomingMessage);

module.exports = router;