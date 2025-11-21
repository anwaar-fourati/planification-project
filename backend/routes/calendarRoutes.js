const express = require('express');
const router = express.Router();

// Importer les contrôleurs
const {
    creerEvenement,
    getEvenementsProjet,
    getEvenement,
    updateEvenement,
    deleteEvenement,
    getEvenementsAVenir
} = require('../controllers/calendarController');

// Importer le middleware de protection
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes sont protégées (nécessitent authentification)

// @route   GET /api/calendar/upcoming
// @desc    Récupérer les événements à venir pour tous les projets de l'utilisateur
// @access  Private
router.get('/upcoming', protect, getEvenementsAVenir);

// @route   GET /api/calendar/:eventId
// @desc    Récupérer un événement spécifique
// @access  Private
router.route('/:eventId')
    .get(protect, getEvenement)
    .put(protect, updateEvenement)
    .delete(protect, deleteEvenement);

module.exports = router;