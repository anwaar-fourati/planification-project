// Importer les outils nécessaires
const jwt = require('jsonwebtoken');

// Importer le modèle Utilisateur pour chercher dans la BDD
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    // 1. Vérifier si un token est présent dans les en-têtes et s'il commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extraire le token de l'en-tête (en enlevant "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 3. Vérifier et décoder le token
            // jwt.verify va retourner le "payload" que nous y avions mis (l'objet { id: user._id })
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Récupérer l'utilisateur depuis la BDD avec l'id du token
            // On exclut le champ du mot de passe pour la sécurité
            req.user = await User.findById(decoded.id).select('-mot_de_passe');

            // 5. Si tout est bon, passer à la suite (le prochain middleware ou le contrôleur)
            next();

        } catch (error) {
            console.error(error);
            res.status(401); // 401 = Unauthorized
            throw new Error('Non autorisé, le token a échoué');
        }
    }

    // S'il n'y a pas de token du tout
    if (!token) {
        res.status(401);
        throw new Error('Non autorisé, pas de token');
    }
};

// Exporter le middleware
module.exports = { protect };