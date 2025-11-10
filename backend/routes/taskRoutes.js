const express = require('express');
const router = express.Router();

const { creerTache } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Route pour créer une tâche dans un projet spécifique
// Le ":id" correspondra à l'ID du projet
router.post('/:id/tasks', protect, creerTache);

// Plus tard, vous pourrez ajouter d'autres routes ici :
// router.get('/:id/tasks', protect, getTachesDuProjet);
// router.put('/tasks/:taskId', protect, updateTache);
// router.delete('/tasks/:taskId', protect, deleteTache);


module.exports = router;