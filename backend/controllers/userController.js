// IMPORTS 
// JWT : pour générer des tokens d'authentification
const jwt = require('jsonwebtoken');
// bcryptjs : pour hacher et comparer les mots de passe
const bcrypt = require('bcryptjs');
// crypto : pour générer des tokens aléatoires pour la réinitialisation
const crypto = require('crypto');
// nodemailer : pour envoyer des emails
const nodemailer = require('nodemailer');
// Modèle utilisateur
const User = require('../models/userModel');


// Génère un token JWT pour l'utilisateur connecté ou inscrit
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // le token expirera dans 30 jours
    });
};


// --- INSCRIPTION ---
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { nom, prenom, email, motdepasse, role } = req.body;

    // Vérifie que tous les champs obligatoires sont présents
    if (!nom || !prenom || !email || !motdepasse) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
    }

    // Vérifie si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Cet utilisateur existe déjà.' });

    // Création du nouvel utilisateur
    const user = await User.create({
        nom,
        prenom,
        email,
        motdepasse, // le mot de passe sera automatiquement haché par le pre('save') dans le modèle
        role,
    });

    // Réponse si succès
    if (user) {
        res.status(201).json({
            _id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // on renvoie également un token JWT
        });
    } else {
        res.status(400).json({ message: 'Données utilisateur invalides.' });
    }
};


// --- CONNEXION ---
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, motdepasse } = req.body;

    // Cherche l'utilisateur par email
    const user = await User.findOne({ email });

    // Vérifie si l'utilisateur existe et si le mot de passe correspond
    if (user && (await bcrypt.compare(motdepasse, user.motdepasse))) {
        res.json({
            _id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // renvoie un token JWT
        });
    } else {
        res.status(401).json({ message: 'Email ou mot de passe invalide.' });
    }
};


// --- PROFIL UTILISATEUR ---
// @route   GET /api/users/profile
// @access  Private (nécessite le middleware protect)
const getUserProfile = async (req, res) => {
    // req.user est déjà rempli par le middleware protect
    res.status(200).json(req.user);
};


// --- MOT DE PASSE OUBLIÉ ---
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Cherche l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        // Génère un token aléatoire pour la réinitialisation
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 3600000; // valable 1 heure
        await user.save();

        // Crée le lien complet de réinitialisation
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

        // Configure Nodemailer pour Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // mot de passe d'application
            },
        });

        // Paramètres de l'email
        const mailOptions = {
            to: user.email,
            subject: 'Réinitialisation du mot de passe',
            html: `
                <p>Bonjour ${user.prenom},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Cliquez sur ce lien pour le changer :</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Ce lien expirera dans 1 heure.</p>
            `,
        };

        // Envoi de l'email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Email de réinitialisation envoyé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- RÉINITIALISATION DU MOT DE PASSE ---
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { motdepasse } = req.body;

    try {
        // Cherche l'utilisateur avec token valide
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }, // token non expiré
        });

        if (!user) return res.status(400).json({ message: "Lien invalide ou expiré." });

        // Hache le nouveau mot de passe et sauvegarde
        user.motdepasse = await bcrypt.hash(motdepasse, 10);
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();

        res.json({ message: "Mot de passe réinitialisé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// EXPORTATION DES FONCTIONS 
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
};
