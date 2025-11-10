const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// @desc    Créer une nouvelle tâche dans un projet
// @route   POST /api/projects/:id/tasks
// @access  Private (seulement créateur du projet)
const creerTache = async (req, res) => {
    // ... (votre code existant pour creerTache reste le même)
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

// @desc    Récupérer toutes les tâches d'un projet
// @route   GET /api/projects/:id/tasks
// @access  Private (membres du projet)
const getTachesDuProjet = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Vérifier que l'utilisateur est membre du projet pour voir les tâches
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.' });
        }

        const taches = await Task.find({ projet: req.params.id })
            .populate('assigneA', 'nom prenom email') // Pour afficher les infos de l'utilisateur assigné
            .sort({ createdAt: -1 });

        res.status(200).json(taches);

    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour une tâche
// @route   PUT /api/tasks/:taskId
// @access  Private (seulement créateur du projet)
const updateTache = async (req, res) => {
    try {
        const { nom, description, statut, priorite, dateEcheance, assigneA } = req.body;
        const tache = await Task.findById(req.params.taskId);

        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        const projet = await Project.findById(tache.projet);

        // Seul le créateur du projet peut modifier la tâche
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }
        
        // Si on change l'assignation, vérifier que le nouvel utilisateur est bien membre
        if (assigneA && !projet.estMembre(assigneA)) {
            return res.status(400).json({ message: 'L\'utilisateur assigné doit être membre du projet' });
        }

        // Mettre à jour les champs
        tache.nom = nom || tache.nom;
        tache.description = description !== undefined ? description : tache.description;
        tache.statut = statut || tache.statut;
        tache.priorite = priorite || tache.priorite;
        tache.dateEcheance = dateEcheance || tache.dateEcheance;
        tache.assigneA = assigneA || tache.assigneA;

        const tacheMiseAJour = await tache.save();
        res.status(200).json(tacheMiseAJour);

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Supprimer une tâche
// @route   DELETE /api/tasks/:taskId
// @access  Private (seulement créateur du projet)
const deleteTache = async (req, res) => {
    try {
        const tache = await Task.findById(req.params.taskId);

        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        
        const projet = await Project.findById(tache.projet);
        
        // Seul le créateur du projet peut supprimer la tâche
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        // Retirer la tâche du tableau de tâches du projet
        await Project.updateOne(
            { _id: tache.projet },
            { $pull: { taches: tache._id } }
        );

        await tache.deleteOne();
        
        res.status(200).json({ message: 'Tâche supprimée avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


module.exports = {
    creerTache,
    getTachesDuProjet,
    updateTache,
    deleteTache
};