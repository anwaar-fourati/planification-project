const Project = require('../models/projectModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const Task = require('../models/taskModel');

// @desc    Créer un nouveau projet
// @route   POST /api/projects
// @access  Private
const creerProjet = async (req, res) => {
    try {
        const { nom, description, dateEcheance, priorite } = req.body;

        // Validation
        if (!nom) {
            return res.status(400).json({ message: 'Le nom du projet est requis' });
        }

        // Générer un code d'accès unique
        let codeAcces;
        let codeExiste = true;
        
        // S'assurer que le code est unique
        while (codeExiste) {
            codeAcces = Project.genererCodeAcces();
            const projetExistant = await Project.findOne({ codeAcces });
            if (!projetExistant) {
                codeExiste = false;
            }
        }

        // Créer le projet
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

        // Peupler les données du créateur
        await projet.populate('createur', 'nom prenom email');

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

        // Trouver le projet
        const projet = await Project.findOne({ codeAcces: codeAcces.toUpperCase() });

        if (!projet) {
            return res.status(404).json({ message: 'Aucun projet trouvé avec ce code' });
        }

        // Vérifier si l'utilisateur est déjà membre
        if (projet.estMembre(req.user._id)) {
            return res.status(400).json({ message: 'Vous êtes déjà membre de ce projet' });
        }

        // Ajouter l'utilisateur comme membre
        projet.membres.push({
            utilisateur: req.user._id,
            role: 'membre'
        });

        await projet.save();
        await projet.populate('createur', 'nom prenom email');
        await projet.populate('membres.utilisateur', 'nom prenom email');

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
        const { emails } = req.body; // Array d'emails

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: 'Veuillez fournir au moins un email' });
        }

        const projet = await Project.findById(req.params.id);

        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        // Vérifier que l'utilisateur est le créateur
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le créateur peut inviter des membres' });
        }

        // Pour chaque email
        for (const email of emails) {
            // Vérifier si l'email est déjà invité
            const dejaInvite = projet.invitationsPendantes.some(inv => inv.email === email);
            
            if (!dejaInvite) {
                // Ajouter à la liste des invitations
                projet.invitationsPendantes.push({ email });

                // Envoyer l'email d'invitation
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
        // Trouver tous les projets où l'utilisateur est membre ou créateur
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

        // Vérifier que l'utilisateur est membre
        if (!projet.estMembre(req.user._id)) {
            return res.status(403).json({ message: 'Accès refusé' });
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

        // Vérifier que l'utilisateur est le créateur
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le créateur peut modifier le projet' });
        }

        // Mettre à jour les champs autorisés
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

        // Vérifier que l'utilisateur est le créateur
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le créateur peut supprimer le projet' });
        }

        await projet.deleteOne();

        res.status(200).json({ message: 'Projet supprimé avec succès' });

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
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

        // Le créateur ne peut pas quitter son propre projet
        if (projet.estCreateur(req.user._id)) {
            return res.status(400).json({ message: 'Le créateur ne peut pas quitter le projet. Supprimez-le à la place.' });
        }

        // Retirer l'utilisateur des membres
        projet.membres = projet.membres.filter(
            m => m.utilisateur.toString() !== req.user._id.toString()
        );

        await projet.save();

        res.status(200).json({ message: 'Vous avez quitté le projet avec succès' });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }};
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

        // Vérifier que l'utilisateur est le créateur
        if (!projet.estCreateur(req.user._id)) {
            return res.status(403).json({ message: 'Seul le créateur peut retirer des membres' });
        }
        
        // On ne peut pas retirer le chef de projet lui-même
        if (projet.createur.toString() === membreId) {
             return res.status(400).json({ message: 'Le chef de projet ne peut pas être retiré' });
        }

        // Vérifier si le membre existe dans le projet
        const membreExiste = projet.membres.some(m => m.utilisateur.toString() === membreId);
        if (!membreExiste) {
            return res.status(404).json({ message: 'Ce membre ne fait pas partie du projet' });
        }

        // Retirer le membre du tableau
        projet.membres = projet.membres.filter(
            m => m.utilisateur.toString() !== membreId
        );
        
        // Optionnel : Retirer l'assignation des tâches de ce membre
        await Task.updateMany(
            { projet: projet._id, assigneA: membreId },
            { $unset: { assigneA: "" } } // ou { $set: { assigneA: null } }
        );


        await projet.save();

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