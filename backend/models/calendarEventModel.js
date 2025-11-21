const mongoose = require('mongoose');

const calendarEventSchema = mongoose.Schema(
    {
        // Titre de l'événement
        titre: {
            type: String,
            required: [true, 'Veuillez entrer un titre pour l\'événement'],
            trim: true
        },
        
        // Description de l'événement
        description: {
            type: String,
            trim: true
        },
        
        // Type d'événement
        type: {
            type: String,
            enum: ['meeting', 'task', 'reminder', 'deadline', 'other'],
            default: 'meeting',
            required: true
        },
        
        // Le projet auquel cet événement appartient
        projet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        
        // Créateur de l'événement
        createur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        
        // Date et heure de début
        dateDebut: {
            type: Date,
            required: [true, 'La date de début est requise']
        },
        
        // Date et heure de fin
        dateFin: {
            type: Date,
            required: [true, 'La date de fin est requise']
        },
        
        // Lieu (pour les meetings physiques)
        lieu: {
            type: String,
            trim: true
        },
        
        // Lien (pour les meetings en ligne)
        lien: {
            type: String,
            trim: true
        },
        
        // Participants invités (optionnel, tous les membres du projet peuvent voir)
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        
        // Couleur pour l'affichage dans le calendrier
        couleur: {
            type: String,
            default: '#8B5CF6' // Purple par défaut
        },
        
        // Statut de l'événement
        statut: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        
        // Événement récurrent
        recurrence: {
            type: String,
            enum: ['none', 'daily', 'weekly', 'monthly'],
            default: 'none'
        },
        
        // Rappels
        rappels: [{
            type: {
                type: String,
                enum: ['email', 'notification'],
                default: 'notification'
            },
            minutesAvant: {
                type: Number, // Minutes avant l'événement
                default: 15
            }
        }],
        
        // Notes ou commentaires
        notes: {
            type: String,
            trim: true
        },
        
        // Événement toute la journée
        touteJournee: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true // Ajoute automatiquement createdAt et updatedAt
    }
);

// Index pour améliorer les performances de recherche
calendarEventSchema.index({ projet: 1, dateDebut: 1 });
calendarEventSchema.index({ projet: 1, dateFin: 1 });

// Méthode pour vérifier si un utilisateur peut modifier l'événement
calendarEventSchema.methods.peutModifier = function(userId) {
    return this.createur.toString() === userId.toString();
};

// Validation: la date de fin doit être après la date de début
calendarEventSchema.pre('save', function(next) {
    if (this.dateFin <= this.dateDebut) {
        next(new Error('La date de fin doit être postérieure à la date de début'));
    }
    next();
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;