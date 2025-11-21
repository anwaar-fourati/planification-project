const CalendarEvent = require('../models/calendarEventModel');
const Project = require('../models/projectModel');

// @desc    Créer un nouvel événement dans le calendrier du projet
// @route   POST /api/projects/:projectId/calendar
// @access  Private (membres du projet)
const creerEvenement = async (req, res) => {
    try {
        const { titre, description, type, dateDebut, dateFin, lieu, lien, participants, couleur, touteJournee, notes, recurrence } = req.body;
        const projectId = req.params.projectId;

        // Vérifier que le projet existe
        const projet = await Project.findById(projectId);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Vérifier que l'utilisateur est membre du projet
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Vous devez être membre du projet pour créer un événement' });
        }

        // Validation des dates
        if (new Date(dateFin) <= new Date(dateDebut)) {
            return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début' });
        }

        // Créer l'événement
        const evenement = await CalendarEvent.create({
            titre,
            description,
            type: type || 'meeting',
            projet: projectId,
            createur: req.user._id,
            dateDebut,
            dateFin,
            lieu,
            lien,
            participants,
            couleur: couleur || '#8B5CF6',
            touteJournee: touteJournee || false,
            notes,
            recurrence: recurrence || 'none'
        });

        // Peupler les informations
        await evenement.populate('createur', 'nom prenom email');
        await evenement.populate('participants', 'nom prenom email');

        res.status(201).json({
            message: 'Événement créé avec succès',
            evenement
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de l\'événement' });
    }
};

// @desc    Récupérer tous les événements du calendrier d'un projet
// @route   GET /api/projects/:projectId/calendar
// @access  Private (membres du projet)
const getEvenementsProjet = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { startDate, endDate, type } = req.query;

        // Vérifier que le projet existe
        const projet = await Project.findById(projectId);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Vérifier que l'utilisateur est membre du projet
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.' });
        }

        // Construire la requête de filtrage
        let query = { projet: projectId };

        // Filtrer par plage de dates si fournie
        if (startDate && endDate) {
            query.dateDebut = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Filtrer par type si fourni
        if (type && type !== 'all') {
            query.type = type;
        }

        // Récupérer les événements
        const evenements = await CalendarEvent.find(query)
            .populate('createur', 'nom prenom email')
            .populate('participants', 'nom prenom email')
            .sort({ dateDebut: 1 });

        res.status(200).json({
            nombre: evenements.length,
            evenements
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer un événement spécifique
// @route   GET /api/calendar/:eventId
// @access  Private (membres du projet)
const getEvenement = async (req, res) => {
    try {
        const evenement = await CalendarEvent.findById(req.params.eventId)
            .populate('createur', 'nom prenom email')
            .populate('participants', 'nom prenom email')
            .populate('projet', 'nom');

        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        // Vérifier que l'utilisateur est membre du projet
        const projet = await Project.findById(evenement.projet._id);
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.status(200).json(evenement);

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour un événement
// @route   PUT /api/calendar/:eventId
// @access  Private (créateur de l'événement OU chef de projet)
const updateEvenement = async (req, res) => {
    try {
        const evenement = await CalendarEvent.findById(req.params.eventId);

        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const projet = await Project.findById(evenement.projet);

        // Seul le créateur de l'événement ou le chef de projet peut le modifier
        const isCreateur = evenement.peutModifier(req.user._id);
        const isChefProjet = projet.estCreateur(req.user._id);

        if (!isCreateur && !isChefProjet) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        // Récupérer les champs à mettre à jour
        const { titre, description, type, dateDebut, dateFin, lieu, lien, participants, couleur, statut, touteJournee, notes, recurrence } = req.body;

        // Validation des dates si elles sont modifiées
        const newDateDebut = dateDebut ? new Date(dateDebut) : evenement.dateDebut;
        const newDateFin = dateFin ? new Date(dateFin) : evenement.dateFin;

        if (newDateFin <= newDateDebut) {
            return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début' });
        }

        // Mettre à jour les champs
        if (titre) evenement.titre = titre;
        if (description !== undefined) evenement.description = description;
        if (type) evenement.type = type;
        if (dateDebut) evenement.dateDebut = dateDebut;
        if (dateFin) evenement.dateFin = dateFin;
        if (lieu !== undefined) evenement.lieu = lieu;
        if (lien !== undefined) evenement.lien = lien;
        if (participants) evenement.participants = participants;
        if (couleur) evenement.couleur = couleur;
        if (statut) evenement.statut = statut;
        if (touteJournee !== undefined) evenement.touteJournee = touteJournee;
        if (notes !== undefined) evenement.notes = notes;
        if (recurrence) evenement.recurrence = recurrence;

        const evenementMisAJour = await evenement.save();
        await evenementMisAJour.populate('createur', 'nom prenom email');
        await evenementMisAJour.populate('participants', 'nom prenom email');

        res.status(200).json({
            message: 'Événement mis à jour avec succès',
            evenement: evenementMisAJour
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Supprimer un événement
// @route   DELETE /api/calendar/:eventId
// @access  Private (créateur de l'événement OU chef de projet)
const deleteEvenement = async (req, res) => {
    try {
        const evenement = await CalendarEvent.findById(req.params.eventId);

        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const projet = await Project.findById(evenement.projet);

        // Seul le créateur de l'événement ou le chef de projet peut le supprimer
        const isCreateur = evenement.peutModifier(req.user._id);
        const isChefProjet = projet.estCreateur(req.user._id);

        if (!isCreateur && !isChefProjet) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        await evenement.deleteOne();

        res.status(200).json({ message: 'Événement supprimé avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer les événements à venir pour tous les projets de l'utilisateur
// @route   GET /api/calendar/upcoming
// @access  Private
const getEvenementsAVenir = async (req, res) => {
    try {
        const { days = 7 } = req.query; // Par défaut, les 7 prochains jours

        // Trouver tous les projets dont l'utilisateur est membre
        const projets = await Project.find({
            $or: [
                { createur: req.user._id },
                { 'membres.utilisateur': req.user._id }
            ]
        });

        const projectIds = projets.map(p => p._id);

        // Date actuelle et date future
        const maintenant = new Date();
        const dateFuture = new Date();
        dateFuture.setDate(dateFuture.getDate() + parseInt(days));

        // Récupérer tous les événements à venir
        const evenements = await CalendarEvent.find({
            projet: { $in: projectIds },
            dateDebut: {
                $gte: maintenant,
                $lte: dateFuture
            },
            statut: { $ne: 'cancelled' }
        })
        .populate('createur', 'nom prenom email')
        .populate('participants', 'nom prenom email')
        .populate('projet', 'nom')
        .sort({ dateDebut: 1 });

        res.status(200).json({
            nombre: evenements.length,
            evenements
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    creerEvenement,
    getEvenementsProjet,
    getEvenement,
    updateEvenement,
    deleteEvenement,
    getEvenementsAVenir
};