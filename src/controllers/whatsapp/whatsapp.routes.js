const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp.controller');

// Déclaration de la route POST pour la réception des messages
router.post('/', whatsappController.handleIncomingMessage);

module.exports = router;