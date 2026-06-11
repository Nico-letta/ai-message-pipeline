/**
 * Service de communication officiel avec l'API Notify.cg
 */
async function sendWhatsAppMessage(lid, text, name = 'Fidèle ICC') {
    //  Récupération de l'URL depuis le .env avec un fallback propre
    const url = process.env.NOTIFY_API_URL || 'https://app.notify.cg/api/external/send';
    
    //  Récupération du Token (Strictement requis !)
    const token = process.env.NOTIFY_API_TOKEN;

    if (!token) {
        throw new Error(" [Notify Service] Sécurité : Le token NOTIFY_API_TOKEN est introuvable dans le fichier .env");
    }

    console.log(` [Notify Service] Expédition de la réponse via l'API externe vers le LID: ${lid}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                canal: 'whatsapp',
                message: text,
                phoneNumber: lid,
                name: name
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API Notify (${response.status}) : ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        const result = contentType && contentType.includes("application/json") 
            ? await response.json() 
            : await response.text();

        console.log(` [Notify Service] Message transmis avec succès à la passerelle Notify !`);
        return result;

    } catch (error) {
        console.error(` [Notify Service] Échec de l'envoi HTTP :`, error.message);
        throw error;
    }
}

module.exports = {
    sendWhatsAppMessage
};