const express = require('express');
const router = express.Router();

// Importer les contrôleurs
const {
    creerProjet,
    rejoindreProjet,
    inviterMembres,
    getMesProjets,
    getProjet,
    updateProjet,
    deleteProjet,
    quitterProjet
} = require('../controllers/projectController');

// Importer le middleware de protection
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes sont protégées (nécessitent authentification)

// Routes générales
router.route('/')
    .get(protect, getMesProjets)      // GET /api/projects - Récupérer tous mes projets
    .post(protect, creerProjet);       // POST /api/projects - Créer un nouveau projet

// Route pour rejoindre un projet avec un code
router.post('/join', protect, rejoindreProjet);  // POST /api/projects/join

// Routes spécifiques à un projet
router.route('/:id')
    .get(protect, getProjet)          // GET /api/projects/:id - Récupérer un projet
    .put(protect, updateProjet)       // PUT /api/projects/:id - Mettre à jour un projet
    .delete(protect, deleteProjet);   // DELETE /api/projects/:id - Supprimer un projet

// Route pour inviter des membres
router.post('/:id/invite', protect, inviterMembres);  // POST /api/projects/:id/invite

// Route pour quitter un projet
router.post('/:id/leave', protect, quitterProjet);    // POST /api/projects/:id/leave

module.exports = router;