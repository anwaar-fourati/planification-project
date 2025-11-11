const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// @desc    Créer une nouvelle tâche dans un projet
// @route   POST /api/projects/:id/tasks
// @access  Private (seulement créateur du projet)
const creerTache = async (req, res) => {
    try {
        const { nom, description, priorite, dateEcheance, assigneA, statut } = req.body;
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
            priorite: priorite || 'Meduim',
            dateEcheance,
            assigneA,
            statut: statut || 'À faire',
            projet: projectId,
            createur: req.user._id
        });

        // Peupler les informations de l'utilisateur assigné
        await tache.populate('assigneA', 'nom prenom email');

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
            .populate('assigneA', 'nom prenom email')
            .populate('createur', 'nom prenom email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            nombre: taches.length,
            taches
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer une tâche spécifique
// @route   GET /api/tasks/:taskId
// @access  Private (membres du projet)
const getTache = async (req, res) => {
    try {
        const tache = await Task.findById(req.params.taskId)
            .populate('assigneA', 'nom prenom email')
            .populate('createur', 'nom prenom email')
            .populate('projet', 'nom');

        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        const projet = await Project.findById(tache.projet._id);
        
        // Vérifier que l'utilisateur est membre du projet
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.status(200).json(tache);

    } catch (error) {
        console.error('Erreur lors de la récupération de la tâche:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour une tâche
// @route   PUT /api/tasks/:taskId
// @access  Private (créateur du projet OU utilisateur assigné pour le statut uniquement)
const updateTache = async (req, res) => {
    try {
        const { nom, description, statut, priorite, dateEcheance, assigneA } = req.body;
        const tache = await Task.findById(req.params.taskId);

        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        const projet = await Project.findById(tache.projet);

        // Le créateur du projet peut tout modifier
        const isCreateur = projet.estCreateur(req.user._id);
        
        // L'utilisateur assigné peut seulement changer le statut
        const isAssigne = tache.assigneA && tache.assigneA.toString() === req.user._id.toString();

        if (!isCreateur && !isAssigne) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        // Si c'est l'utilisateur assigné (et pas le créateur), il ne peut modifier que le statut
        if (isAssigne && !isCreateur) {
            if (statut) {
                tache.statut = statut;
            } else {
                return res.status(403).json({ message: 'Vous ne pouvez modifier que le statut de vos tâches' });
            }
        } else {
            // Le créateur peut tout modifier
            if (nom) tache.nom = nom;
            if (description !== undefined) tache.description = description;
            if (statut) tache.statut = statut;
            if (priorite) tache.priorite = priorite;
            if (dateEcheance) tache.dateEcheance = dateEcheance;
            
            // Si on change l'assignation, vérifier que le nouvel utilisateur est bien membre
            if (assigneA !== undefined) {
                if (assigneA && !projet.estMembre(assigneA)) {
                    return res.status(400).json({ message: 'L\'utilisateur assigné doit être membre du projet' });
                }
                tache.assigneA = assigneA;
            }
        }

        const tacheMiseAJour = await tache.save();
        await tacheMiseAJour.populate('assigneA', 'nom prenom email');
        
        res.status(200).json({
            message: 'Tâche mise à jour avec succès',
            tache: tacheMiseAJour
        });

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

// @desc    Récupérer les tâches assignées à l'utilisateur connecté
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMesTaches = async (req, res) => {
    try {
        const taches = await Task.find({ assigneA: req.user._id })
            .populate('projet', 'nom codeAcces')
            .populate('createur', 'nom prenom email')
            .sort({ dateEcheance: 1 }); // Trier par date d'échéance

        res.status(200).json({
            nombre: taches.length,
            taches
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    creerTache,
    getTachesDuProjet,
    getTache,
    updateTache,
    deleteTache,
    getMesTaches
};