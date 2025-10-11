require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuration du transporteur pour Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // mot de passe d'application
  },
});

// Fonction pour envoyer un email de réinitialisation
const sendResetPasswordEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Réinitialisation du mot de passe',
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur ce lien pour le changer :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ce lien expirera dans 1 heure.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès à', toEmail);
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email :', error);
  }
};

module.exports = { sendResetPasswordEmail };
