/**
 * Contrôleur pour la gestion des Webhooks WhatsApp via Notify
 */

/**
 * Réceptionne les messages envoyés par les fidèles
 * POST /api/v1/webhook/whatsapp
 */
const handleIncomingMessage = async (req, res) => {
    try {
        const payload = req.body;

        console.log(' Nouveau webhook reçu de Notify !');
        console.log('Contenu brut du payload :', JSON.stringify(payload, null, 2));

        // TODO: Étape suivante -> Valider la sécurité avec le WHATSAPP_WEBHOOK_SECRET
        // TODO: Étape suivante -> Envoyer le payload dans la file d'attente BullMQ

        // Règle d'or : On répond TOUJOURS immédiatement 200 OK à Notify
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook reçu avec succès par le serveur ICC-IA' 
        });

    } catch (error) {
        console.error(' Erreur interne dans le contrôleur du webhook :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = {
    handleIncomingMessage
};