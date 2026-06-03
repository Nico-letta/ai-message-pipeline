/**
 * Contrôleur pour la gestion des Webhooks WhatsApp via Notify
 */
const { whatsappQueue } = require('../../config/queue');

/**
 * Réceptionne les messages envoyés par les fidèles
 * POST /api/v1/webhook/whatsapp
 */
const handleIncomingMessage = async (req, res) => {
    try {
        const payload = req.body;

        console.log(' Nouveau webhook reçu de Notify ! Spooling dans BullMQ...');
        // console.log('Contenu brut du payload :', JSON.stringify(payload, null, 2));

        // TODO: Étape suivante -> Valider la sécurité avec le WHATSAPP_WEBHOOK_SECRET
        //  On pousse le message dans la file d'attente
        // Le premier argument 'incoming-message' est juste le nom du job
        await whatsappQueue.add('incoming-message', {
            from: payload.from,
            text: payload.text,
            timestamp: new Date()
        });

        // Règle d'or : Réponse ultra-rapide (< 200ms) pour libérer Notify
        return res.status(200).json({ 
            success: true, 
            message: 'Message pris en charge et mis en file d’attente.' 
        });

    } catch (error) {
        console.error(' Erreur lors de la mise en file d’attente :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = {
    handleIncomingMessage
};