// Importer les outils nécessaires
const express = require('express');
const router = express.Router(); // Créer un routeur Express

// Importer les fonctions du contrôleur que nous allons créer à l'étape 6
const {
    registerUser,
    loginUser,
    getUserProfile,
} = require('../controllers/userController');

// Importer le middleware d'authentification que nous créerons à l'étape 7
const { protect } = require('../middleware/authMiddleware');

// === Définition des routes ===

// Route pour l'inscription d'un utilisateur
// POST /api/users/
router.post('/', registerUser);

// Route pour la connexion d'un utilisateur
// POST /api/users/login
router.post('/login', loginUser);

// Route pour récupérer le profil de l'utilisateur connecté
// GET /api/users/profile
// On ajoute le middleware "protect" pour sécuriser cette route
router.get('/profile', protect, getUserProfile);


// Route POST : lorsqu'un utilisateur a oublié son mot de passe
// → Il envoie son email à cette route
// → Le contrôleur "forgotPassword" va générer un lien temporaire et l'envoyer par email
router.post('/forgot-password', forgotPassword);


// Route POST : lorsqu'un utilisateur clique sur le lien reçu dans son email
// → Le lien contient un "token" unique (dans l'URL : /reset-password/:token)
// → L'utilisateur soumet ici son nouveau mot de passe
// → Le contrôleur "resetPassword" vérifie le token et met à jour le mot de passe dans la base de données
router.post('/reset-password/:token', resetPassword);



// Exporter le routeur pour l'utiliser dans server.js
module.exports = router;