const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Créer un "transporter" (le service qui va envoyer l'email, ici Gmail)
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Pas besoin de configurer host/port pour les services connus
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Définir les options de l'email (expéditeur, destinataire, sujet, contenu)
    const mailOptions = {
        from: `Votre App <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: ... (on peut aussi envoyer du HTML)
    };

    // 3) Envoyer l'email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;