const Project = require('../models/projectModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const Task = require('../models/taskModel');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const MeetingRoom = require('../models/meetingRoomModel');
const { creerMeetingRoomPourProjet, ajouterMembreMeetingRoom } = require('../controllers/meetingController');

// @desc    Créer un nouveau projet
// @route   POST /api/projects
// @access  Private
const creerProjet = async (req, res) => {
    try {
        const { nom, description, dateEcheance, priorite } = req.body;

        if (!nom) {
            return res.status(400).json({ message: 'Le nom du projet est requis' });
        }

        let codeAcces;
        let codeExiste = true;
        
        while (codeExiste) {
            codeAcces = Project.genererCodeAcces();
            const projetExistant = await Project.findOne({ codeAcces });
            if (!projetExistant) {
                codeExiste = false;
            }
        }

        const projet = await Project.create({
            nom,
            description,
            codeAcces,
            createur: req.user._id,
            dateEcheance,
            priorite: priorite || 'Medium',
            membres: [{
                utilisateur: req.user._id,
                role: 'chef_projet'
            }]
        });

        await projet.populate('createur', 'nom prenom email');

        // NOUVEAU: Créer automatiquement une salle de réunion pour ce projet
        try {
            await creerMeetingRoomPourProjet(projet._id, req.user._id, projet.nom);
        } catch (meetingError) {
            console.error('Erreur lors de la création de la salle de réunion:', meetingError);
            // On continue même si la création de la salle échoue
        }

        // NOUVEAU: Créer automatiquement un chat pour ce projet
        try {
            await Chat.create({
                projet: projet._id,
                nom: `${projet.nom} - Chat`,
                membres: projet.membres.map(m => ({ utilisateur: m.utilisateur }))
            });
        } catch (chatError) {
            console.error('Erreur lors de la création du chat de projet:', chatError);
            // On continue même si le chat ne peut pas être créé
        }

        res.status(201).json({
            message: 'Projet créé avec succès',
            projet: {
                _id: projet._id,
                nom: projet.nom,
                description: projet.description,
                codeAcces: projet.codeAcces,
                createur: projet.createur,
                statut: projet.statut,
                priorite: projet.priorite,
                dateEcheance: projet.dateEcheance,
                progression: projet.progression,
                nombreMembres: projet.membres.length
            }
        });

    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du projet' });
    }
};

// @desc    Rejoindre un projet avec un code
// @route   POST /api/projects/join
// @access  Private
const rejoindreProjet = async (req, res) => {
    try {
        const { codeAcces } = req.body;

        if (!codeAcces) {
            return res.status(400).json({ message: 'Le code d\'accès est requis' });
        }

        const projet = await Project.findOne({ codeAcces: codeAcces.toUpperCase() });

        if (!projet) {
            return res.status(404).json({ message: 'Aucun projet trouvé avec ce code' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur.toString() === userId;
        const isMember = projet.membres.some(m => m.utilisateur.toString() === userId);

        if (isCreator || isMember) {
            return res.status(400).json({ message: 'Vous êtes déjà membre de ce projet' });
        }

        projet.membres.push({
            utilisateur: req.user._id,
            role: 'membre'
        });

        await projet.save();
        await projet.populate('createur', 'nom prenom email');
        await projet.populate('membres.utilisateur', 'nom prenom email');

        // NOUVEAU: Ajouter automatiquement l'utilisateur à la salle de réunion du projet
        try {
            await ajouterMembreMeetingRoom(projet._id, req.user._id);
        } catch (meetingError) {
            console.error('Erreur lors de l\'ajout à la salle de réunion:', meetingError);
            // On continue même si l'ajout à la salle échoue
        }

        // NOUVEAU: Ajouter l'utilisateur au chat du projet (crée le chat si absent). Ensure no duplicates.
        try {
            let chat = await Chat.findOne({ projet: projet._id });
            if (!chat) {
                chat = await Chat.create({
                    projet: projet._id,
                    nom: `${projet.nom} - Chat`,
                    membres: projet.membres.map(m => ({ utilisateur: m.utilisateur }))
                });
            } else {
                const isMember = chat.membres.some(m => m.utilisateur.toString() === req.user._id.toString());
                if (!isMember) {
                    chat.membres.push({ utilisateur: req.user._id });
                    await chat.save();
                }
            }
        } catch (chatErr) {
            console.error('Erreur lors de l\'ajout au chat du projet:', chatErr);
        }

        res.status(200).json({
            message: 'Vous avez rejoint le projet avec succès',
            projet
        });

    } catch (error) {
        console.error('Erreur lors de la jonction au projet:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Inviter des membres par email
// @route   POST /api/projects/:id/invite
// @access  Private (seulement créateur)
const inviterMembres = async (req, res) => {
    try {
        const { emails } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: 'Veuillez fournir au moins un email' });
        }

        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le créateur peut inviter des membres' });
        }

        for (const email of emails) {
            const dejaInvite = projet.invitationsPendantes.some(inv => inv.email === email);
            
            if (!dejaInvite) {
                projet.invitationsPendantes.push({ email });

                const message = `
                    Bonjour,
                    
                    Vous avez été invité(e) à rejoindre le projet "${projet.nom}" sur Unision.
                    
                    Pour rejoindre le projet, connectez-vous à votre compte et utilisez le code suivant :
                    
                    Code d'accès : ${projet.codeAcces}
                    
                    Ou cliquez sur ce lien : ${process.env.FRONTEND_URL}/projects/join/${projet.codeAcces}
                    
                    Cordialement,
                    L'équipe Unision
                `;

                try {
                    await sendEmail({
                        email,
                        subject: `Invitation au projet ${projet.nom}`,
                        message
                    });
                } catch (emailError) {
                    console.error(`Erreur d'envoi d'email à ${email}:`, emailError);
                }
            }
        }

        await projet.save();

        res.status(200).json({
            message: 'Invitations envoyées avec succès',
            nombreInvitations: emails.length
        });

    } catch (error) {
        console.error('Erreur lors de l\'invitation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer tous les projets de l'utilisateur
// @route   GET /api/projects
// @access  Private
const getMesProjets = async (req, res) => {
    try {
        const projets = await Project.find({
            $or: [
                { createur: req.user._id },
                { 'membres.utilisateur': req.user._id }
            ]
        })
        .populate('createur', 'nom prenom email')
        .populate('membres.utilisateur', 'nom prenom email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            nombre: projets.length,
            projets
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Récupérer un projet par ID
// @route   GET /api/projects/:id
// @access  Private
const getProjet = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id)
            .populate('createur', 'nom prenom email')
            .populate('membres.utilisateur', 'nom prenom email');

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur._id.toString() === userId;
        const isMember = projet.membres.some(m => m.utilisateur._id.toString() === userId);

        if (!isCreator && !isMember) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.' });
        }

        res.status(200).json(projet);

    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Mettre à jour un projet
// @route   PUT /api/projects/:id
// @access  Private (seulement créateur)
const updateProjet = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur.toString() === userId;
        
        if (!isCreator) {
            return res.status(403).json({ message: 'Seul le créateur peut modifier le projet' });
        }

        const { nom, description, statut, priorite, dateEcheance, progression } = req.body;

        if (nom) projet.nom = nom;
        if (description !== undefined) projet.description = description;
        if (statut) projet.statut = statut;
        if (priorite) projet.priorite = priorite;
        if (dateEcheance) projet.dateEcheance = dateEcheance;
        if (progression !== undefined) projet.progression = progression;

        await projet.save();

        res.status(200).json({
            message: 'Projet mis à jour avec succès',
            projet
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Supprimer un projet
// @route   DELETE /api/projects/:id
// @access  Private (seulement créateur)
const deleteProjet = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur.toString() === userId;
        
        if (!isCreator) {
            return res.status(403).json({ message: 'Seul le créateur peut supprimer le projet' });
        }

        // CORRECTION: Supprimer la salle de réunion AVANT de supprimer le projet
        try {
            const deleted = await MeetingRoom.deleteOne({ projet: projet._id });
            console.log('✅ Meeting room deleted:', deleted);
        } catch (meetingError) {
            console.error('❌ Error deleting meeting room:', meetingError);
        }

        // Supprimer le chat et les messages liés au projet
        try {
            const chat = await Chat.findOne({ projet: projet._id });
            if (chat) {
                await Message.deleteMany({ chat: chat._id });
                await Chat.deleteOne({ _id: chat._id });
                console.log('✅ Chat deleted');
            }
        } catch (chatDelErr) {
            console.error('❌ Error deleting chat:', chatDelErr);
        }

        // Supprimer toutes les tâches du projet
        try {
            await Task.deleteMany({ projet: projet._id });
            console.log('✅ Tasks deleted');
        } catch (taskError) {
            console.error('❌ Error deleting tasks:', taskError);
        }

        // Supprimer le projet
        await projet.deleteOne();
        console.log('✅ Project deleted');

        res.status(200).json({ message: 'Projet supprimé avec succès' });

    } catch (error) {
        console.error('❌ Error deleting project:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Quitter un projet
// @route   POST /api/projects/:id/leave
// @access  Private
const quitterProjet = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur.toString() === userId;
        
        if (isCreator) {
            return res.status(400).json({ message: 'Le créateur ne peut pas quitter le projet. Supprimez-le à la place.' });
        }

        projet.membres = projet.membres.filter(
            m => m.utilisateur.toString() !== userId
        );

        await projet.save();

        // Retirer l'utilisateur du chat du projet
        try {
            await Chat.updateOne({ projet: projet._id }, { $pull: { membres: { utilisateur: req.user._id } } });
        } catch (chatErr) {
            console.error('Erreur lors du retrait du membre du chat:', chatErr);
        }

        // Retirer l'utilisateur de la salle de réunion
        try {
            await MeetingRoom.updateOne(
                { projet: projet._id },
                { $pull: { membres: { utilisateur: req.user._id } } }
            );
        } catch (meetingErr) {
            console.error('Erreur lors du retrait de la salle:', meetingErr);
        }

        res.status(200).json({ message: 'Vous avez quitté le projet avec succès' });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// @desc    Retirer un membre d'un projet
// @route   DELETE /api/projects/:id/members/:membreId
// @access  Private (seulement créateur)
const retirerMembre = async (req, res) => {
    try {
        const projet = await Project.findById(req.params.id);
        const { membreId } = req.params;

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const userId = req.user._id.toString();
        const isCreator = projet.createur.toString() === userId;
        
        if (!isCreator) {
            return res.status(403).json({ message: 'Seul le créateur peut retirer des membres' });
        }
        
        if (projet.createur.toString() === membreId) {
             return res.status(400).json({ message: 'Le chef de projet ne peut pas être retiré' });
        }

        const membreExiste = projet.membres.some(m => m.utilisateur.toString() === membreId);
        if (!membreExiste) {
            return res.status(404).json({ message: 'Ce membre ne fait pas partie du projet' });
        }

        projet.membres = projet.membres.filter(
            m => m.utilisateur.toString() !== membreId
        );
        
        await Task.updateMany(
            { projet: projet._id, assigneA: membreId },
            { $unset: { assigneA: "" } }
        );

        await projet.save();

        // Retirer le membre du chat du projet
        try {
            await Chat.updateOne({ projet: projet._id }, { $pull: { membres: { utilisateur: membreId } } });
        } catch (chatErr) {
            console.error('Erreur lors du retrait du membre du chat:', chatErr);
        }

        // Retirer le membre de la salle de réunion
        try {
            await MeetingRoom.updateOne(
                { projet: projet._id },
                { $pull: { membres: { utilisateur: membreId } } }
            );
        } catch (meetingErr) {
            console.error('Erreur lors du retrait de la salle:', meetingErr);
        }

        res.status(200).json({ message: 'Membre retiré avec succès' });

    } catch (error) {
        console.error('Erreur lors du retrait du membre:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    creerProjet,
    rejoindreProjet,
    inviterMembres,
    getMesProjets,
    getProjet,
    updateProjet,
    deleteProjet,
    quitterProjet,
    retirerMembre
};