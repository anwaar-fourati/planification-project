const MeetingRoom = require('../models/meetingRoomModel');
const Project = require('../models/projectModel');

// @desc    Créer automatiquement une salle de réunion pour un projet
// @note    Cette fonction est appelée automatiquement lors de la création d'un projet
const creerMeetingRoomPourProjet = async (projectId, userId, projectName) => {
    try {
        // Générer un code d'accès unique
        let codeAcces;
        let codeExiste = true;
        
        while (codeExiste) {
            codeAcces = MeetingRoom.genererCodeAcces();
            const salleExistante = await MeetingRoom.findOne({ codeAcces });
            if (!salleExistante) {
                codeExiste = false;
            }
        }

        // Créer la salle de réunion
        const meetingRoom = await MeetingRoom.create({
            projet: projectId,
            nom: `${projectName} - Meeting Room`,
            description: `Salle de réunion pour le projet ${projectName}`,
            codeAcces: codeAcces,
            createur: userId,
            membres: [{
                utilisateur: userId,
                role: 'host', // Le créateur du projet est l'hôte
                statut: 'offline'
            }]
        });

        return meetingRoom;
    } catch (error) {
        console.error('Erreur lors de la création de la salle de réunion:', error);
        throw error;
    }
};

// @desc    Ajouter un membre à la salle de réunion lors de l'ajout au projet
// @note    Cette fonction est appelée automatiquement lors de l'ajout d'un membre au projet
const ajouterMembreMeetingRoom = async (projectId, userId) => {
    try {
        const meetingRoom = await MeetingRoom.findOne({ projet: projectId });
        
        if (!meetingRoom) {
            throw new Error('Salle de réunion non trouvée pour ce projet');
        }

        // Ajouter le membre s'il n'existe pas déjà
        if (!meetingRoom.estMembre(userId)) {
            meetingRoom.ajouterMembre(userId, 'participant');
            await meetingRoom.save();
        }

        return meetingRoom;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre à la salle:', error);
        throw error;
    }
};

// @desc    Récupérer toutes les salles de réunion de l'utilisateur
// @route   GET /api/meetings
// @access  Private
const getMesSallesReunion = async (req, res) => {
    try {
        const salles = await MeetingRoom.find({
            'membres.utilisateur': req.user._id,
            statut: 'active'
        })
        .populate('projet', 'nom description statut')
        .populate('createur', 'nom prenom email')
        .populate('membres.utilisateur', 'nom prenom email')
        .sort({ 'reunionEnCours.active': -1, createdAt: -1 }); // Les réunions actives en premier

        res.status(200).json({
            nombre: salles.length,
            salles
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des salles:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer une salle de réunion spécifique
// @route   GET /api/meetings/:roomId
// @access  Private (membres de la salle)
const getSalleReunion = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId)
            .populate('projet', 'nom description statut')
            .populate('createur', 'nom prenom email')
            .populate('membres.utilisateur', 'nom prenom email')
            .populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email')
            .populate('messages.expediteur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle de réunion non trouvée' });
        }

        // Vérifier que l'utilisateur est membre de la salle
        if (!salle.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de cette salle.' });
        }

        res.status(200).json(salle);

    } catch (error) {
        console.error('Erreur lors de la récupération de la salle:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Rejoindre une salle de réunion avec un code
// @route   POST /api/meetings/join
// @access  Private
const rejoindreSalleAvecCode = async (req, res) => {
    try {
        const { codeAcces } = req.body;

        if (!codeAcces) {
            return res.status(400).json({ message: 'Le code d\'accès est requis' });
        }

        const salle = await MeetingRoom.findOne({ 
            codeAcces: codeAcces.toUpperCase(),
            statut: 'active'
        })
        .populate('projet', 'nom')
        .populate('createur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée avec ce code' });
        }

        // Vérifier si l'utilisateur est déjà membre
        if (salle.estMembre(req.user._id)) {
            return res.status(400).json({ message: 'Vous êtes déjà membre de cette salle' });
        }

        // Ajouter l'utilisateur à la salle
        salle.ajouterMembre(req.user._id, 'participant');
        await salle.save();

        await salle.populate('membres.utilisateur', 'nom prenom email');

        res.status(200).json({
            message: 'Vous avez rejoint la salle avec succès',
            salle
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Démarrer une réunion
// @route   POST /api/meetings/:roomId/start
// @access  Private (hôte ou modérateur)
const demarrerReunion = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est membre
        if (!salle.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        // Vérifier si une réunion est déjà en cours
        if (salle.reunionEnCours.active) {
            return res.status(400).json({ message: 'Une réunion est déjà en cours' });
        }

        // Démarrer la réunion
        salle.demarrerReunion();
        
        // Ajouter l'utilisateur actuel comme premier participant
        salle.reunionEnCours.participantsActuels.push({
            utilisateur: req.user._id,
            dateConnexion: new Date(),
            micro: req.body.micro || false,
            camera: req.body.camera || false,
            partageEcran: false
        });

        await salle.save();
        await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

        res.status(200).json({
            message: 'Réunion démarrée avec succès',
            salle
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Rejoindre une réunion en cours
// @route   POST /api/meetings/:roomId/join-meeting
// @access  Private (membres de la salle)
const rejoindreReunion = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est membre
        if (!salle.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        // Vérifier si une réunion est en cours
        if (!salle.reunionEnCours.active) {
            return res.status(400).json({ message: 'Aucune réunion en cours' });
        }

        // Vérifier si l'utilisateur n'est pas déjà dans la réunion
        const dejaPresent = salle.reunionEnCours.participantsActuels.some(
            p => p.utilisateur.toString() === req.user._id.toString()
        );

        if (dejaPresent) {
            return res.status(400).json({ message: 'Vous êtes déjà dans la réunion' });
        }

        // Ajouter l'utilisateur à la réunion
        salle.reunionEnCours.participantsActuels.push({
            utilisateur: req.user._id,
            dateConnexion: new Date(),
            micro: req.body.micro || false,
            camera: req.body.camera || false,
            partageEcran: false
        });

        await salle.save();
        await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

        res.status(200).json({
            message: 'Vous avez rejoint la réunion',
            salle
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Quitter une réunion
// @route   POST /api/meetings/:roomId/leave-meeting
// @access  Private
const quitterReunion = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Retirer l'utilisateur de la réunion en cours
        salle.reunionEnCours.participantsActuels = salle.reunionEnCours.participantsActuels.filter(
            p => p.utilisateur.toString() !== req.user._id.toString()
        );

        // Si c'était le dernier participant, terminer la réunion
        if (salle.reunionEnCours.participantsActuels.length === 0) {
            salle.terminerReunion();
        }

        await salle.save();

        res.status(200).json({ message: 'Vous avez quitté la réunion' });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Terminer une réunion
// @route   POST /api/meetings/:roomId/end
// @access  Private (hôte uniquement)
const terminerReunion = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est l'hôte
        if (!salle.estHote(req.user._id)) {
            return res.status(403).json({ message: 'Seul l\'hôte peut terminer la réunion' });
        }

        // Vérifier si une réunion est en cours
        if (!salle.reunionEnCours.active) {
            return res.status(400).json({ message: 'Aucune réunion en cours' });
        }

        // Terminer la réunion
        salle.terminerReunion();
        await salle.save();

        res.status(200).json({
            message: 'Réunion terminée avec succès',
            statistiques: salle.statistiques
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Envoyer un message dans le chat de la salle
// @route   POST /api/meetings/:roomId/messages
// @access  Private (membres de la salle)
const envoyerMessage = async (req, res) => {
    try {
        const { contenu, type = 'text' } = req.body;
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est membre
        if (!salle.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        if (!contenu) {
            return res.status(400).json({ message: 'Le contenu du message est requis' });
        }

        // Ajouter le message
        const message = {
            expediteur: req.user._id,
            contenu,
            type,
            dateEnvoi: new Date()
        };

        salle.messages.push(message);
        await salle.save();

        await salle.populate('messages.expediteur', 'nom prenom email');

        // Récupérer le dernier message ajouté
        const dernierMessage = salle.messages[salle.messages.length - 1];

        res.status(201).json({
            message: 'Message envoyé',
            messageData: dernierMessage
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer les messages d'une salle
// @route   GET /api/meetings/:roomId/messages
// @access  Private (membres de la salle)
const getMessages = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const salle = await MeetingRoom.findById(req.params.roomId)
            .select('messages')
            .populate('messages.expediteur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Récupérer les derniers messages
        const messages = salle.messages
            .slice(-parseInt(limit))
            .sort((a, b) => a.dateEnvoi - b.dateEnvoi);

        res.status(200).json({
            nombre: messages.length,
            messages
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour les paramètres de la salle
// @route   PUT /api/meetings/:roomId/settings
// @access  Private (hôte uniquement)
const updateParametres = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est l'hôte
        if (!salle.estHote(req.user._id)) {
            return res.status(403).json({ message: 'Seul l\'hôte peut modifier les paramètres' });
        }

        const { microParDefaut, cameraParDefaut, chatActive, partageEcranActive, enregistrementAutorise } = req.body;

        // Mettre à jour les paramètres
        if (microParDefaut !== undefined) salle.parametres.microParDefaut = microParDefaut;
        if (cameraParDefaut !== undefined) salle.parametres.cameraParDefaut = cameraParDefaut;
        if (chatActive !== undefined) salle.parametres.chatActive = chatActive;
        if (partageEcranActive !== undefined) salle.parametres.partageEcranActive = partageEcranActive;
        if (enregistrementAutorise !== undefined) salle.parametres.enregistrementAutorise = enregistrementAutorise;

        await salle.save();

        res.status(200).json({
            message: 'Paramètres mis à jour',
            parametres: salle.parametres
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer l'historique des réunions
// @route   GET /api/meetings/:roomId/history
// @access  Private (membres de la salle)
const getHistorique = async (req, res) => {
    try {
        const salle = await MeetingRoom.findById(req.params.roomId)
            .select('historique statistiques')
            .populate('historique.participants.utilisateur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // Vérifier que l'utilisateur est membre
        if (!salle.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.status(200).json({
            statistiques: salle.statistiques,
            historique: salle.historique.sort((a, b) => b.dateDebut - a.dateDebut)
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    creerMeetingRoomPourProjet,
    ajouterMembreMeetingRoom,
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
};