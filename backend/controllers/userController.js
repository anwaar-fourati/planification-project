// Importer les outils nécessaires
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// Exporter les fonctions pour les utiliser dans les routes
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};