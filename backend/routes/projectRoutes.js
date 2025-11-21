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
    quitterProjet,
    retirerMembre
} = require('../controllers/projectController');

// Importer les contrôleurs de tâches
const { creerTache, getTachesDuProjet } = require('../controllers/taskController');

// Importer les contrôleurs de calendrier
const { creerEvenement, getEvenementsProjet } = require('../controllers/calendarController');

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

// Route pour retirer un membre (par le chef de projet)
router.delete('/:id/members/:membreId', protect, retirerMembre);

// ROUTES POUR LES TÂCHES LIÉES À UN PROJET
router.route('/:id/tasks')
    .post(protect, creerTache)      // POST /api/projects/:id/tasks - Créer une tâche
    .get(protect, getTachesDuProjet);   // GET /api/projects/:id/tasks - Lister les tâches

// ROUTES POUR LE CALENDRIER DU PROJET
router.route('/:projectId/calendar')
    .post(protect, creerEvenement)      // POST /api/projects/:projectId/calendar - Créer un événement
    .get(protect, getEvenementsProjet); // GET /api/projects/:projectId/calendar - Lister les événements

module.exports = router;