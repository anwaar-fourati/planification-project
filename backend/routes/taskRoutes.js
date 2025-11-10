const express = require('express');
const router = express.Router();

const { creerTache } = require('../controllers/taskController');
const { updateTache, deleteTache } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Route pour créer une tâche dans un projet spécifique
// Le ":id" correspondra à l'ID du projet
router.post('/:id/tasks', protect, creerTache);

// Routes pour modifier ou supprimer une tâche spécifique
router.route('/:taskId')
    .put(protect, updateTache)        // PUT /api/tasks/:taskId - Mettre à jour une tâche
    .delete(protect, deleteTache);    // DELETE /api/tasks/:taskId - Supprimer une tâche

module.exports = router;