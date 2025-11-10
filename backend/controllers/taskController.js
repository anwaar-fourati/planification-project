const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// @desc    Créer une nouvelle tâche dans un projet
// @route   POST /api/projects/:id/tasks
// @access  Private (seulement créateur du projet)
const creerTache = async (req, res) => {
    try {
        const { nom, description, priorite, dateEcheance, assigneA } = req.body;
        const projectId = req.params.id;

        if (!nom) {
            return res.status(400).json({ message: 'Le nom de la tâche est requis' });
        }
        
        const projet = await Project.findById(projectId);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Seul le créateur du projet peut créer et assigner des tâches
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le chef de projet peut ajouter des tâches' });
        }

        // Si la tâche est assignée, vérifier que l'utilisateur assigné est bien membre du projet
        if (assigneA) {
            if (!projet.estMembre(assigneA)) {
                return res.status(400).json({ message: 'Vous ne pouvez assigner une tâche qu\'à un membre du projet' });
            }
        }

        // Créer la tâche
        const tache = await Task.create({
            nom,
            description,
            priorite,
            dateEcheance,
            assigneA,
            projet: projectId,
            createur: req.user._id
        });

        // Ajouter la référence de la tâche au projet
        projet.taches.push(tache._id);
        await projet.save();

        res.status(201).json({
            message: 'Tâche créée avec succès',
            tache
        });

    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de la tâche' });
    }
};

module.exports = {
    creerTache,
};