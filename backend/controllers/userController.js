// Importer les outils nécessaires
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Importer le modèle Utilisateur
const User = require('../models/userModel');

// --- FONCTION D'AIDE ---
// Fonction pour générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Le token expirera dans 30 jours
    });
};

// --- CONTRÔLEURS ---

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {

    console.log('Corps de la requête reçu :', req.body);
    // 1. Récupérer les données du corps de la requête
    const { nom, prenom, email, mot_de_passe, role } = req.body;

    // 2. Valider que tous les champs sont présents
    if (!nom || !prenom || !email || !mot_de_passe) {
        res.status(400); // 400 = Bad Request
        throw new Error('Veuillez ajouter tous les champs');
    }

    // 3. Vérifier si l'utilisateur existe déjà dans la BDD
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Cet utilisateur existe déjà');
    }

    // 4. Créer le nouvel utilisateur dans la BDD
    const user = await User.create({
        nom,
        prenom,
        email,
        mot_de_passe, // Le hachage est géré automatiquement par le "pre save" dans le modèle !
        role,
    });

    // 5. Si l'utilisateur a été créé avec succès
    if (user) {
        // Renvoyer les informations de l'utilisateur et un token
        res.status(201).json({ // 201 = Created
            _id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Données utilisateur invalides');
    }
};

// @desc    Connecter (authentifier) un utilisateur
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    // 1. Récupérer l'email et le mot de passe du corps de la requête
    const { email, mot_de_passe } = req.body;

    // 2. Chercher l'utilisateur dans la BDD par son email
    const user = await User.findOne({ email });

    // 3. Si l'utilisateur existe ET que le mot de passe correspond
    if (user && (await bcrypt.compare(mot_de_passe, user.mot_de_passe))) {
        // Renvoyer ses informations et un nouveau token
        res.json({
            _id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // 401 = Unauthorized
        throw new Error('Email ou mot de passe invalide');
    }
};

// @desc    Récupérer les informations du profil de l'utilisateur
// @route   GET /api/users/profile
// @access  Private (protégé)
const getUserProfile = async (req, res) => {
    // La magie opère ici : le middleware "protect" aura déjà identifié
    // l'utilisateur et l'aura attaché à l'objet "req".
    // Nous n'avons donc qu'à renvoyer les informations.
    res.status(200).json(req.user);
};

// (Ajoutez ce code après la fonction getUserProfile)

// @desc    Demande de réinitialisation de mot de passe (génère le token et envoie l'email)
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    // 1. Trouver l'utilisateur par son email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        // On ne révèle pas que l'utilisateur n'existe pas pour des raisons de sécurité
        // On renvoie une réponse de succès même si l'email n'est pas trouvé.
        return res.status(200).json({ message: 'Email envoyé' });
    }

    // 2. Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. Hacher le token et le sauvegarder dans la BDD
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Le token expirera dans 10 minutes
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 4. Créer l'URL de réinitialisation que l'utilisateur cliquera dans l'email
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    
    const message = `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\nCliquez sur le lien suivant, ou collez-le dans votre navigateur pour terminer le processus :\n\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email et votre mot de passe restera inchangé.`;

    try {
        // --- LOGIQUE D'ENVOI D'EMAIL (à configurer) ---
         await sendEmail({ email: user.email, subject: 'Réinitialisation de mot de passe', message });

        res.status(200).json({ message: 'Email envoyé' });
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        throw new Error("L'envoi de l'email a échoué");
    }
};

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    // 1. Hacher le token reçu dans l'URL pour le comparer à celui dans la BDD
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    // 2. Trouver l'utilisateur avec ce token et qui n'a pas expiré
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // $gt = greater than
    });

    if (!user) {
        res.status(400);
        throw new Error('Le token est invalide ou a expiré');
    }

    // 3. Mettre à jour le mot de passe
    user.mot_de_passe = req.body.mot_de_passe;
    // Effacer les champs du token de réinitialisation
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // Le hook "pre save" va automatiquement hacher le nouveau mot de passe

    // 4. Renvoyer une réponse avec un nouveau token de connexion
    res.status(200).json({
        _id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Renvoyer un token pour connecter l'utilisateur directement
    });
};
// Exporter les fonctions pour les utiliser dans les routes
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword, // Ajouter
    resetPassword,  // Ajouter
};