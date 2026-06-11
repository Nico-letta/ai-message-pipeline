// src/controllers/whatsapp/whatsapp.routes.js
const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp.controller');

// Route GET pour la vérification de Meta
router.get('/', whatsappController.verifyWebhook);

// Route POST pour la réception des messages
router.post('/', whatsappController.receiveMessage);

module.exports = router;