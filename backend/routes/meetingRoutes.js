const express = require('express');
const router = express.Router();

// Importer les contrôleurs
const {
    getMesSallesReunion,
    getSalleReunion,
    rejoindreSalleAvecCode,
    demarrerReunion,
    rejoindreReunion,
    quitterReunion,
    terminerReunion,
    envoyerMessage,
    getMessages,
    updateParametres,
    getHistorique
} = require('../controllers/meetingController');

// Importer le middleware de protection
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes sont protégées (nécessitent authentification)

// @route   GET /api/meetings
// @desc    Récupérer toutes les salles de réunion de l'utilisateur
// @access  Private
router.get('/', protect, getMesSallesReunion);

// @route   POST /api/meetings/join
// @desc    Rejoindre une salle avec un code
// @access  Private
router.post('/join', protect, rejoindreSalleAvecCode);

// @route   GET /api/meetings/:roomId
// @desc    Récupérer une salle spécifique
// @access  Private
router.get('/:roomId', protect, getSalleReunion);

// @route   POST /api/meetings/:roomId/start
// @desc    Démarrer une réunion
// @access  Private
router.post('/:roomId/start', protect, demarrerReunion);

// @route   POST /api/meetings/:roomId/join-meeting
// @desc    Rejoindre une réunion en cours
// @access  Private
router.post('/:roomId/join-meeting', protect, rejoindreReunion);

// @route   POST /api/meetings/:roomId/leave-meeting
// @desc    Quitter une réunion
// @access  Private
router.post('/:roomId/leave-meeting', protect, quitterReunion);

// @route   POST /api/meetings/:roomId/end
// @desc    Terminer une réunion (hôte uniquement)
// @access  Private
router.post('/:roomId/end', protect, terminerReunion);

// @route   POST /api/meetings/:roomId/messages
// @desc    Envoyer un message dans le chat
// @access  Private
router.post('/:roomId/messages', protect, envoyerMessage);

// @route   GET /api/meetings/:roomId/messages
// @desc    Récupérer les messages de la salle
// @access  Private
router.get('/:roomId/messages', protect, getMessages);

// @route   PUT /api/meetings/:roomId/settings
// @desc    Mettre à jour les paramètres de la salle
// @access  Private (hôte uniquement)
router.put('/:roomId/settings', protect, updateParametres);

// @route   GET /api/meetings/:roomId/history
// @desc    Récupérer l'historique des réunions
// @access  Private
router.get('/:roomId/history', protect, getHistorique);

module.exports = router;