// Importer les outils nécessaires
const express = require('express');
const router = express.Router(); // Créer un routeur Express

// Importer les fonctions du contrôleur que nous allons créer à l'étape 6
const {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,     
    resetPassword, 
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

// Route pour la demande de réinitialisation de mot de passe
router.post('/forgotpassword', forgotPassword);

// Route pour la réinitialisation effective du mot de passe
router.put('/resetpassword/:resettoken', resetPassword);
// Exporter le routeur pour l'utiliser dans server.js
module.exports = router;