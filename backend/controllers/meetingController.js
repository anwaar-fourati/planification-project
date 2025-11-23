const MeetingRoom = require('../models/meetingRoomModel');
const Project = require('../models/projectModel');

// @desc    Créer automatiquement une salle de réunion pour un projet
const creerMeetingRoomPourProjet = async (projectId, userId, projectName) => {
    try {
        console.log('📷 Creating meeting room for project:', projectId, 'by user:', userId);

        // Check if meeting room already exists
        const existingRoom = await MeetingRoom.findOne({ projet: projectId });
        if (existingRoom) {
            console.log('⚠️ Meeting room already exists:', existingRoom._id);
            return existingRoom;
        }

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
                role: 'host',
                statut: 'offline',
                dateAjout: new Date()
            }]
        });

        console.log('✅ Meeting room created successfully:', meetingRoom._id);
        return meetingRoom;
    } catch (error) {
        console.error('❌ Error creating meeting room:', error);
        throw error;
    }
};

// @desc    Ajouter un membre à la salle de réunion
const ajouterMembreMeetingRoom = async (projectId, userId) => {
    try {
        console.log('📷 Adding member to meeting room. Project:', projectId, 'User:', userId);

        const meetingRoom = await MeetingRoom.findOne({ projet: projectId });
        
        if (!meetingRoom) {
            console.error('❌ Meeting room not found for project:', projectId);
            // Try to create it if it doesn't exist
            const project = await Project.findById(projectId);
            if (project) {
                return await creerMeetingRoomPourProjet(projectId, userId, project.nom);
            }
            throw new Error('Salle de réunion non trouvée pour ce projet');
        }

        // Check if user is already a member
        const isMember = meetingRoom.membres.some(
            m => m.utilisateur.toString() === userId.toString()
        );

        if (!isMember) {
            meetingRoom.membres.push({
                utilisateur: userId,
                role: 'participant',
                statut: 'offline',
                dateAjout: new Date()
            });
            await meetingRoom.save();
            console.log('✅ Member added to meeting room:', userId);
        } else {
            console.log('ℹ️ User already member of meeting room');
        }

        return meetingRoom;
    } catch (error) {
        console.error('❌ Error adding member to meeting room:', error);
        throw error;
    }
};

// @desc    Récupérer toutes les salles de réunion de l'utilisateur
// @route   GET /api/meetings
// @access  Private
const getMesSallesReunion = async (req, res) => {
    try {
        const userId = req.user._id;

        const salles = await MeetingRoom.find({
            $or: [
                { createur: userId },
                { 'membres.utilisateur': userId }
            ],
            statut: 'active'
        })
        .populate('projet', 'nom description statut')
        .populate('createur', 'nom prenom email')
        .populate('membres.utilisateur', 'nom prenom email')
        .sort({ 'reunionEnCours.active': -1, createdAt: -1 });

        res.status(200).json({
            nombre: salles.length,
            salles
        });

    } catch (error) {
        console.error('❌ Error fetching meeting rooms:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer une salle de réunion spécifique
// @route   GET /api/meetings/:roomId
// @access  Private
const getSalleReunion = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId)
            .populate('projet', 'nom description statut')
            .populate('createur', 'nom prenom email')
            .populate('membres.utilisateur', 'nom prenom email')
            .populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email')
            .populate('messages.expediteur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle de réunion non trouvée' });
        }

        const isCreator = salle.createur._id.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur._id.toString() === userId
        );

        if (!isCreator && !isMember) {
            if (salle.projet) {
                const project = await Project.findById(salle.projet._id);
                if (project) {
                    const isProjectMember = project.estMembre(userId);
                    if (isProjectMember) {
                        console.log('ℹ️ User is project member. Adding to meeting room...');
                        await ajouterMembreMeetingRoom(project._id, userId);
                        
                        const updatedSalle = await MeetingRoom.findById(req.params.roomId)
                            .populate('projet', 'nom description statut')
                            .populate('createur', 'nom prenom email')
                            .populate('membres.utilisateur', 'nom prenom email')
                            .populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email')
                            .populate('messages.expediteur', 'nom prenom email');
                        
                        return res.status(200).json(updatedSalle);
                    }
                }
            }
            
            return res.status(403).json({ 
                message: 'Accès refusé. Vous n\'êtes pas membre de cette salle.' 
            });
        }

        res.status(200).json(salle);

    } catch (error) {
        console.error('❌ Error fetching meeting room:', error);
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

        const userId = req.user._id.toString();
        const isCreator = salle.createur._id.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (isCreator || isMember) {
            return res.status(400).json({ message: 'Vous êtes déjà membre de cette salle' });
        }

        salle.membres.push({
            utilisateur: req.user._id,
            role: 'participant',
            statut: 'offline',
            dateAjout: new Date()
        });

        await salle.save();
        await salle.populate('membres.utilisateur', 'nom prenom email');

        res.status(200).json({
            message: 'Vous avez rejoint la salle avec succès',
            salle
        });

    } catch (error) {
        console.error('❌ Error joining meeting room:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Démarrer une réunion - UPDATED
// @route   POST /api/meetings/:roomId/start
// @access  Private
const demarrerReunion = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId)
            .populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        // If meeting is already active
        if (salle.reunionEnCours.active) {
            const alreadyInMeeting = salle.reunionEnCours.participantsActuels.some(
                p => p.utilisateur.toString() === userId
            );

            if (alreadyInMeeting) {
                return res.status(200).json({
                    message: 'Vous êtes déjà dans la réunion',
                    salle
                });
            }

            // Add user to existing meeting
            salle.reunionEnCours.participantsActuels.push({
                utilisateur: req.user._id,
                dateConnexion: new Date(),
                micro: req.body.micro || false,
                camera: req.body.camera || false,
                partageEcran: false
            });

            // Add to complete participants list BEFORE saving
            salle.ajouterParticipantReunion(req.user._id);

            await salle.save();
            await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

            return res.status(200).json({
                message: 'Vous avez rejoint la réunion',
                salle
            });
        }

        // Start new meeting
        salle.demarrerReunion();
        
        // Add user as first participant
        salle.reunionEnCours.participantsActuels = [{
            utilisateur: req.user._id,
            dateConnexion: new Date(),
            micro: req.body.micro || false,
            camera: req.body.camera || false,
            partageEcran: false
        }];

        // Add to complete participants list BEFORE saving
        salle.ajouterParticipantReunion(req.user._id);

        await salle.save();
        await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

        console.log('✅ Meeting started successfully');

        res.status(200).json({
            message: 'Réunion démarrée avec succès',
            salle
        });

    } catch (error) {
        console.error('❌ Error starting meeting:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Rejoindre une réunion en cours - UPDATED
// @route   POST /api/meetings/:roomId/join-meeting
// @access  Private
const rejoindreReunion = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        if (!salle.reunionEnCours.active) {
            return res.status(400).json({ message: 'Aucune réunion en cours' });
        }

        const dejaPresent = salle.reunionEnCours.participantsActuels.some(
            p => p.utilisateur.toString() === userId
        );

        if (dejaPresent) {
            await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');
            return res.status(200).json({
                message: 'Vous êtes déjà dans la réunion',
                salle
            });
        }

        // Add user to meeting
        salle.reunionEnCours.participantsActuels.push({
            utilisateur: req.user._id,
            dateConnexion: new Date(),
            micro: req.body.micro || false,
            camera: req.body.camera || false,
            partageEcran: false
        });

        // Add to complete participants list BEFORE saving
        salle.ajouterParticipantReunion(req.user._id);

        await salle.save();
        await salle.populate('reunionEnCours.participantsActuels.utilisateur', 'nom prenom email');

        res.status(200).json({
            message: 'Vous avez rejoint la réunion',
            salle
        });

    } catch (error) {
        console.error('❌ Error joining meeting:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Quitter une réunion - UPDATED
// @route   POST /api/meetings/:roomId/leave-meeting
// @access  Private
const quitterReunion = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        // NOUVEAU: Enregistrer la déconnexion du participant
        salle.retirerParticipantReunion(userId);

        // Remove user from current participants
        salle.reunionEnCours.participantsActuels = salle.reunionEnCours.participantsActuels.filter(
            p => p.utilisateur.toString() !== userId
        );

        // If last participant, end meeting
        if (salle.reunionEnCours.participantsActuels.length === 0 && salle.reunionEnCours.active) {
            salle.terminerReunion();
            console.log('ℹ️ Last participant left. Meeting ended.');
        }

        await salle.save();

        res.status(200).json({ message: 'Vous avez quitté la réunion' });

    } catch (error) {
        console.error('❌ Error leaving meeting:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Terminer une réunion
// @route   POST /api/meetings/:roomId/end
// @access  Private (host only)
const terminerReunion = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isHost = salle.membres.some(
            m => m.utilisateur.toString() === userId && m.role === 'host'
        );

        if (!isCreator && !isHost) {
            return res.status(403).json({ message: 'Seul l\'hôte peut terminer la réunion' });
        }

        if (!salle.reunionEnCours.active) {
            return res.status(400).json({ message: 'Aucune réunion en cours' });
        }

        // End meeting
        salle.terminerReunion();
        await salle.save();

        console.log('✅ Meeting ended by host');

        res.status(200).json({
            message: 'Réunion terminée avec succès',
            statistiques: salle.statistiques
        });

    } catch (error) {
        console.error('❌ Error ending meeting:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Envoyer un message dans le chat
// @route   POST /api/meetings/:roomId/messages
// @access  Private
const envoyerMessage = async (req, res) => {
    try {
        const { contenu, type = 'text' } = req.body;
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        if (!contenu) {
            return res.status(400).json({ message: 'Le contenu du message est requis' });
        }

        salle.messages.push({
            expediteur: req.user._id,
            contenu,
            type,
            dateEnvoi: new Date()
        });

        await salle.save();
        await salle.populate('messages.expediteur', 'nom prenom email');

        const dernierMessage = salle.messages[salle.messages.length - 1];

        res.status(201).json({
            message: 'Message envoyé',
            messageData: dernierMessage
        });

    } catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer les messages d'une salle
// @route   GET /api/meetings/:roomId/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const userId = req.user._id.toString();
        
        const salle = await MeetingRoom.findById(req.params.roomId)
            .select('messages membres createur')
            .populate('messages.expediteur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const messages = salle.messages
            .slice(-parseInt(limit))
            .sort((a, b) => a.dateEnvoi - b.dateEnvoi);

        res.status(200).json({
            nombre: messages.length,
            messages
        });

    } catch (error) {
        console.error('❌ Error fetching messages:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour les paramètres de la salle
// @route   PUT /api/meetings/:roomId/settings
// @access  Private (host only)
const updateParametres = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId);

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isHost = salle.membres.some(
            m => m.utilisateur.toString() === userId && m.role === 'host'
        );

        if (!isCreator && !isHost) {
            return res.status(403).json({ message: 'Seul l\'hôte peut modifier les paramètres' });
        }

        const { microParDefaut, cameraParDefaut, chatActive, partageEcranActive, enregistrementAutorise } = req.body;

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
        console.error('❌ Error updating settings:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer l'historique des réunions
// @route   GET /api/meetings/:roomId/history
// @access  Private
const getHistorique = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const salle = await MeetingRoom.findById(req.params.roomId)
            .select('historique statistiques membres createur')
            .populate('historique.participants.utilisateur', 'nom prenom email');

        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }

        const isCreator = salle.createur.toString() === userId;
        const isMember = salle.membres.some(
            m => m.utilisateur.toString() === userId
        );

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.status(200).json({
            statistiques: salle.statistiques,
            historique: salle.historique.sort((a, b) => b.dateDebut - a.dateDebut)
        });

    } catch (error) {
        console.error('❌ Error fetching history:', error);
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