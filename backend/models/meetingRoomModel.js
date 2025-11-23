const mongoose = require('mongoose');

const meetingRoomSchema = mongoose.Schema(
    {
        // Le projet associé à cette salle de réunion
        projet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            unique: true // Un seul meeting room par projet
        },
        
        // Nom de la salle (par défaut le nom du projet)
        nom: {
            type: String,
            required: true,
            trim: true
        },
        
        // Description de la salle
        description: {
            type: String,
            trim: true
        },
        
        // Code d'accès unique pour rejoindre la réunion
        codeAcces: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        
        // Créateur de la salle (Scrum Master)
        createur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        
        // Membres de la salle de réunion
        membres: [{
            utilisateur: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['host', 'moderator', 'participant'],
                default: 'participant'
            },
            dateAjout: {
                type: Date,
                default: Date.now
            },
            // Statut de présence
            statut: {
                type: String,
                enum: ['online', 'offline', 'busy'],
                default: 'offline'
            },
            // Dernière activité
            derniereActivite: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Paramètres de la salle
        parametres: {
            // Activer/désactiver le micro par défaut
            microParDefaut: {
                type: Boolean,
                default: false
            },
            // Activer/désactiver la caméra par défaut
            cameraParDefaut: {
                type: Boolean,
                default: false
            },
            // Activer/désactiver le chat
            chatActive: {
                type: Boolean,
                default: true
            },
            // Activer/désactiver le partage d'écran
            partageEcranActive: {
                type: Boolean,
                default: true
            },
            // Limite de participants (0 = illimité)
            limiteParticipants: {
                type: Number,
                default: 0
            },
            // Salle de réunion publique ou privée
            publique: {
                type: Boolean,
                default: false
            },
            // Autoriser l'enregistrement
            enregistrementAutorise: {
                type: Boolean,
                default: false
            }
        },
        
        // Statistiques de la salle
        statistiques: {
            // Nombre total de réunions
            nombreReunions: {
                type: Number,
                default: 0
            },
            // Durée totale des réunions (en minutes)
            dureeTotale: {
                type: Number,
                default: 0
            },
            // Dernière réunion
            derniereReunion: {
                type: Date
            },
            // Nombre de participants maximum atteint
            maxParticipants: {
                type: Number,
                default: 0
            }
        },
        
        // Réunion en cours
        reunionEnCours: {
            active: {
                type: Boolean,
                default: false
            },
            dateDebut: {
                type: Date
            },
            participantsActuels: [{
                utilisateur: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                dateConnexion: {
                    type: Date,
                    default: Date.now
                },
                micro: {
                    type: Boolean,
                    default: false
                },
                camera: {
                    type: Boolean,
                    default: false
                },
                partageEcran: {
                    type: Boolean,
                    default: false
                }
            }],
            // NOUVEAU: Track tous les participants qui ont rejoint la réunion
            tousLesParticipants: [{
                utilisateur: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                dateConnexion: {
                    type: Date,
                    default: Date.now
                },
                dateDeconnexion: {
                    type: Date
                }
            }]
        },
        
        // Lien de la réunion (pour intégration avec des services externes)
        lienReunion: {
            zoom: String,
            meet: String,
            teams: String,
            jitsi: String
        },
        
        // Historique des réunions
        historique: [{
            dateDebut: {
                type: Date,
                required: true
            },
            dateFin: {
                type: Date
            },
            duree: {
                type: Number // en minutes
            },
            participants: [{
                utilisateur: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                dureePresence: Number // en minutes
            }],
            enregistrement: {
                disponible: {
                    type: Boolean,
                    default: false
                },
                url: String,
                taille: Number // en MB
            }
        }],
        
        // Messages/Chat de la salle
        messages: [{
            expediteur: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            contenu: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                enum: ['text', 'file', 'system'],
                default: 'text'
            },
            fichier: {
                nom: String,
                url: String,
                taille: Number
            },
            dateEnvoi: {
                type: Date,
                default: Date.now
            },
            lu: [{
                utilisateur: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                dateLecture: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        
        // Statut de la salle
        statut: {
            type: String,
            enum: ['active', 'archived', 'suspended'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

// Index pour améliorer les performances
meetingRoomSchema.index({ projet: 1 });
meetingRoomSchema.index({ codeAcces: 1 });
meetingRoomSchema.index({ 'membres.utilisateur': 1 });

// Méthode statique pour générer un code d'accès unique
meetingRoomSchema.statics.genererCodeAcces = function() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MEET-';
    for (let i = 0; i < 6; i++) {
        code += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return code;
};

// Méthode pour vérifier si un utilisateur est membre de la salle
meetingRoomSchema.methods.estMembre = function(userId) {
    return this.membres.some(m => m.utilisateur.toString() === userId.toString());
};

// Méthode pour vérifier si un utilisateur est l'hôte (créateur)
meetingRoomSchema.methods.estHote = function(userId) {
    return this.createur.toString() === userId.toString();
};

// Méthode pour ajouter un membre
meetingRoomSchema.methods.ajouterMembre = function(userId, role = 'participant') {
    // Vérifier si l'utilisateur n'est pas déjà membre
    if (!this.estMembre(userId)) {
        this.membres.push({
            utilisateur: userId,
            role: role,
            statut: 'offline'
        });
    }
};

// Méthode pour démarrer une réunion
meetingRoomSchema.methods.demarrerReunion = function() {
    this.reunionEnCours.active = true;
    this.reunionEnCours.dateDebut = new Date();
    this.reunionEnCours.tousLesParticipants = []; // Reset la liste des participants
    this.statistiques.nombreReunions += 1;
};

// NOUVEAU: Méthode pour ajouter un participant à la liste complète
meetingRoomSchema.methods.ajouterParticipantReunion = function(userId) {
    // Vérifier si l'utilisateur n'est pas déjà dans la liste
    const dejaPresent = this.reunionEnCours.tousLesParticipants.some(
        p => p.utilisateur.toString() === userId.toString()
    );
    
    if (!dejaPresent) {
        this.reunionEnCours.tousLesParticipants.push({
            utilisateur: userId,
            dateConnexion: new Date()
        });
    }
};

// NOUVEAU: Méthode pour enregistrer la déconnexion d'un participant
meetingRoomSchema.methods.retirerParticipantReunion = function(userId) {
    const participant = this.reunionEnCours.tousLesParticipants.find(
        p => p.utilisateur.toString() === userId.toString()
    );
    
    if (participant && !participant.dateDeconnexion) {
        participant.dateDeconnexion = new Date();
    }
};

// Méthode pour terminer une réunion - FIXED
meetingRoomSchema.methods.terminerReunion = function() {
    if (this.reunionEnCours.active) {
        const dateDebut = this.reunionEnCours.dateDebut;
        const dateFin = new Date();
        const duree = Math.round((dateFin - dateDebut) / 60000); // en minutes
        
        // CORRECTION: Utiliser tousLesParticipants au lieu de participantsActuels
        const participants = this.reunionEnCours.tousLesParticipants.map(p => {
            const dateConnexion = p.dateConnexion;
            const dateDeconnexion = p.dateDeconnexion || dateFin;
            const dureePresence = Math.round((dateDeconnexion - dateConnexion) / 60000);
            
            return {
                utilisateur: p.utilisateur,
                dureePresence: dureePresence > 0 ? dureePresence : 1 // Minimum 1 minute
            };
        });
        
        // Ajouter à l'historique
        this.historique.push({
            dateDebut: dateDebut,
            dateFin: dateFin,
            duree: duree > 0 ? duree : 1, // Minimum 1 minute
            participants: participants
        });
        
        // Mettre à jour les statistiques
        this.statistiques.dureeTotale += duree;
        this.statistiques.derniereReunion = dateFin;
        
        // CORRECTION: Utiliser le nombre maximum de participants qui étaient connectés en même temps
        const maxParticipantsSimultanes = this.reunionEnCours.tousLesParticipants.length;
        if (maxParticipantsSimultanes > this.statistiques.maxParticipants) {
            this.statistiques.maxParticipants = maxParticipantsSimultanes;
        }
        
        // Réinitialiser la réunion en cours
        this.reunionEnCours = {
            active: false,
            dateDebut: null,
            participantsActuels: [],
            tousLesParticipants: []
        };
    }
};

const MeetingRoom = mongoose.model('MeetingRoom', meetingRoomSchema);

module.exports = MeetingRoom;